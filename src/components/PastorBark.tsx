import { useEffect, useRef, useState } from 'react';
import KaizenLogo from './KaizenLogo';

/**
 * Pastor, la mascota: hazle click y ladra.
 *
 * Esta pensado tambien como ejemplo minimo del modelo de React. Los cuatro
 * conceptos estan marcados abajo con comentarios [1]..[4]:
 *
 *   [1] ESTADO       la memoria que sobrevive entre renders
 *   [2] RENDER PURO  estado -> JSX, sin tocar el DOM a mano
 *   [3] EVENTO       el click no pinta nada, solo cambia el estado
 *   [4] LIMPIEZA     los temporizadores se cancelan al desmontar
 */
export function PastorBark() {
  // [1] ESTADO. `useState` devuelve el valor actual y la funcion para
  // cambiarlo. La clave es que `barking` NO es una variable normal: una
  // variable local se perderia en cada llamada a la funcion. React guarda
  // este valor aparte, asociado a esta instancia del componente, y te lo
  // devuelve en cada render.
  const [barking, setBarking] = useState(false);
  // Segundo estado, para que se vea que persiste: cuantas veces le hablaste.
  const [barks, setBarks] = useState(0);

  // Un `ref` es memoria que persiste igual que el estado, pero cambiarla NO
  // provoca un render. Es justo lo que quieres para cosas que no se dibujan:
  // el id del temporizador y el contexto de audio.
  const timer = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);

  // [4] LIMPIEZA. Lo que devuelve `useEffect` se ejecuta cuando el componente
  // se desmonta. Sin esto, si navegas mientras el ladrido esta en curso, el
  // temporizador dispararia contra un componente que ya no existe. Es el
  // equivalente a un `defer close()`.
  //
  // El array vacio de dependencias significa "solo al montar y al desmontar".
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      void audio.current?.close();
    };
  }, []);

  // [3] EVENTO. Fijate en lo que NO hay aqui: ninguna busqueda de nodos,
  // ningun `classList.add`. Solo se cambia el estado; de repintar se encarga
  // React volviendo a llamar a esta funcion y comparando el resultado con lo
  // que ya hay en pantalla.
  //
  // Los efectos secundarios (sonar, temporizar) viven aqui, en el manejador,
  // nunca en el cuerpo del componente: el cuerpo se ejecuta muchas mas veces
  // de las que imaginas y debe quedarse en calcular el JSX.
  function bark() {
    playBark(audio);
    setBarks((count) => count + 1);
    setBarking(true);

    // Si ya habia un ladrido en curso se cancela su temporizador, o el
    // primero en vencer apagaria la animacion del segundo.
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBarking(false), 700);
  }

  // [2] RENDER PURO. De aqui abajo es solo "dado este estado, asi se ve".
  // No hay logica que modifique nada: `barking` decide las clases y si el
  // bocadillo esta o no en el arbol. Cambia el estado y la pantalla sigue.
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={bark}
        aria-label="Pastor, la mascota de Kaizen. Haz click para que ladre."
        title={barks === 0 ? 'Salúdalo' : `Le has hablado ${barks} ${barks === 1 ? 'vez' : 'veces'}`}
        className={`group grid size-12 place-items-center rounded-full bg-[#c8362d] p-0.5 shadow-lg shadow-[#c8362d]/30 ring-1 ring-[#f4efe4]/25 transition-transform duration-200 outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#c9a227] ${
          barking ? 'pastor-barking' : ''
        }`}
      >
        <KaizenLogo
          width={44}
          height={44}
          alt=""
          className="size-11 rounded-full object-cover"
        />
      </button>

      {/* El bocadillo solo existe en el arbol cuando `barking` es true. */}
      {barking && (
        <span
          role="status"
          className="pastor-bubble absolute -top-1 left-11 z-10 rounded-lg bg-[#f4efe4] px-2 py-1 text-[0.7rem] leading-none font-bold text-[#0f141b] shadow-md"
        >
          <span lang="ja">ワン！</span>
          <span className="sr-only">Guau</span>
        </span>
      )}
    </span>
  );
}

/**
 * Sintetiza un ladrido con Web Audio: un barrido de tono que cae rapido, que
 * es a grandes rasgos la forma de un "guau". Se sintetiza en vez de cargar un
 * mp3 para no sumar un asset al bundle.
 *
 * El contexto se crea en el primer click y se reutiliza: los navegadores
 * bloquean el audio sin gesto del usuario, y un click cuenta como gesto.
 */
function playBark(ref: { current: AudioContext | null }) {
  try {
    ref.current ??= new AudioContext();
    const ctx = ref.current;
    // Si el navegador lo dejo suspendido, el gesto del click lo reanuda.
    void ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // El barrido de 420 Hz a 90 Hz en 140 ms es lo que suena a ladrido.
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // Envolvente: ataque casi instantaneo y caida corta, como un ladrido seco.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Sin audio disponible el ladrido se queda en la animacion; no es motivo
    // para romper la interaccion.
  }
}
