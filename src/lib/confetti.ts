/**
 * Confeti de escarcha y chispas de forja, sin dependencias: un canvas fijo
 * sobre la página que no recibe clics, se anima mientras queden partículas y
 * se quita solo al terminar. Con `prefers-reduced-motion` no lanza nada.
 */

/** Los azules del Winter Arc: escarcha, acero templado y la noche del samurái. */
export const FROST_COLORS = ['#2b7fa8', '#7cc4e8', '#cfe8f5', '#eef7fc', '#0b1624'];

/** Las chispas del yunque. */
export const EMBER_COLORS = ['#f59e0b', '#fb923c', '#fde68a'];

/** Kaizen Habits: el verde matcha, el oro viejo, el bermellón y el papel washi. */
export const HABIT_COLORS = ['#1f6a4b', '#5f9e7c', '#c9a227', '#c8362d', '#f4efe4'];

type Shape = 'strip' | 'flake' | 'spark';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  color: string;
  shape: Shape;
  age: number;
  ttl: number;
}

export interface BurstOptions {
  /** Origen en coordenadas de la ventana (clientX / clientY). */
  x: number;
  y: number;
  count?: number;
  /** Dirección central en radianes: -π/2 es hacia arriba. */
  angle?: number;
  /** Apertura total del abanico en radianes. */
  spread?: number;
  /** Velocidad inicial máxima en px por frame (a 60 fps). */
  speed?: number;
  /** Proporción de chispas de forja, de 0 a 1. */
  embers?: number;
  /** Colores del confeti; por defecto, la escarcha del Winter Arc. */
  colors?: string[];
}

const GRAVITY = 0.32;
const DRAG = 0.985;
const MAX_PARTICLES = 600;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame = 0;
let lastTime = 0;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Lanza un abanico de confeti desde (x, y). */
export function burst({
  x,
  y,
  count = 40,
  angle = -Math.PI / 2,
  spread = Math.PI / 1.6,
  speed = 11,
  embers = 0.2,
  colors = FROST_COLORS,
}: BurstOptions): void {
  if (prefersReducedMotion() || !ensureCanvas()) return;

  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const direction = angle + (Math.random() - 0.5) * spread;
    const velocity = speed * (0.45 + Math.random() * 0.55);
    const ember = Math.random() < embers;
    const shape: Shape = ember ? 'spark' : Math.random() < 0.25 ? 'flake' : 'strip';
    particles.push({
      x,
      y,
      vx: Math.cos(direction) * velocity,
      vy: Math.sin(direction) * velocity,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      size: shape === 'spark' ? 1.5 + Math.random() * 1.5 : 5 + Math.random() * 5,
      color: pick(ember ? EMBER_COLORS : colors),
      shape,
      age: 0,
      // Las chispas se apagan rápido; la escarcha cae despacio.
      ttl: shape === 'spark' ? 35 + Math.random() * 25 : 110 + Math.random() * 70,
    });
  }

  if (!frame) {
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  }
}

/** Dos cañones desde las esquinas de abajo, hacia el centro: la celebración grande. */
export function cannons(count = 90, colors = FROST_COLORS): void {
  const { innerWidth: w, innerHeight: h } = window;
  burst({ x: 0, y: h, count, angle: -Math.PI / 3, spread: Math.PI / 5, speed: 22, embers: 0.15, colors });
  burst({ x: w, y: h, count, angle: (-2 * Math.PI) / 3, spread: Math.PI / 5, speed: 22, embers: 0.15, colors });
}

function ensureCanvas(): boolean {
  if (typeof document === 'undefined') return false;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '60',
    });
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(window.innerWidth * dpr);
  const height = Math.round(window.innerHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx !== null;
}

function tick(now: number): void {
  // dt en frames de 60 fps, acotado para que una pestaña en segundo plano no teletransporte el confeti.
  const dt = Math.min((now - lastTime) / (1000 / 60), 3);
  lastTime = now;

  if (!canvas || !ctx) {
    frame = 0;
    return;
  }
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((p) => {
    p.age += dt;
    const drag = DRAG ** dt;
    p.vx *= drag;
    p.vy = p.vy * drag + GRAVITY * dt * (p.shape === 'spark' ? 0.5 : p.shape === 'flake' ? 0.35 : 1);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.spin * dt;
    if (p.age >= p.ttl || p.y > window.innerHeight + 40) return false;

    draw(ctx!, p, 1 - Math.max(0, (p.age - p.ttl * 0.7) / (p.ttl * 0.3)));
    return true;
  });

  if (particles.length > 0) {
    frame = requestAnimationFrame(tick);
    return;
  }
  frame = 0;
  canvas.remove();
  canvas = null;
  ctx = null;
}

function draw(ctx: CanvasRenderingContext2D, p: Particle, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  switch (p.shape) {
    case 'strip':
      // El coseno del giro aplana la tira: parece que da vueltas en el aire.
      ctx.scale(1, Math.cos(p.rotation * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      break;
    case 'flake':
      // Copo de seis brazos.
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(Math.cos(a) * -p.size * 0.6, Math.sin(a) * -p.size * 0.6);
        ctx.lineTo(Math.cos(a) * p.size * 0.6, Math.sin(a) * p.size * 0.6);
      }
      ctx.stroke();
      break;
    case 'spark':
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
