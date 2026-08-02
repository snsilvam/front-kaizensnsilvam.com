# AGENTS.md

# Kaizen Backend

Este documento define las reglas que deben seguir todos los agentes de IA (Claude Code, Codex, ChatGPT, etc.) al trabajar sobre este repositorio.

---

# Objetivo

Kaizen es una aplicación de finanzas personales.

Su propósito es ayudar al usuario a responder diariamente tres preguntas:

- 💰 ¿Cuánto dinero puedo gastar hoy sin preocuparme?
- 📅 ¿Cuántos días faltan para mi próximo ingreso?
- 🛡️ ¿Voy bien o voy mal respecto a mi plan?

Toda funcionalidad nueva debe aportar valor directo a alguna de estas preguntas.

---

# Filosofía

Este proyecto prioriza:

- KISS (Keep It Simple)
- Clean Architecture
- Código fácil de leer
- Bajo acoplamiento
- Alta cohesión

Evitar soluciones complejas si una solución sencilla resuelve el problema.

---

# Stack

Backend

- Go
- REST API
- Firestore
- Cloud Run (GCP)

Frontend

- React + TypeScript
- Consume únicamente la API REST

---

# Arquitectura

Toda lógica de negocio debe seguir el flujo:

```
HTTP Handler
    ↓
Use Case
    ↓
Repository
    ↓
Firestore
```

Reglas:

- Los handlers no contienen lógica de negocio.
- Los handlers únicamente validan requests y llaman al UseCase.
- Toda regla de negocio vive en el UseCase.
- Firestore solo puede ser utilizado desde Repository.
- Nunca acceder a Firestore desde un Handler.
- Nunca acceder a Firestore desde un UseCase.

---

# Principios

Preferir:

- Métodos pequeños
- Funciones con una única responsabilidad
- Interfaces pequeñas
- Errores explícitos
- Código legible

Evitar:

- Reflexión
- Frameworks pesados
- Abstracciones innecesarias
- Patrones si no resuelven un problema real
- Sobreingeniería

---

# API

Toda funcionalidad nueva debe exponerse mediante REST.

Si se modifica un endpoint:

- actualizar Swagger
- mantener consistencia con el resto de la API

Los nombres de endpoints deben representar casos de uso del negocio.

---

# Firestore

Cada colección tiene su Repository.

No compartir acceso directo a Firestore entre módulos.

Toda consulta debe encapsularse en el Repository.

---

# Modelo de desarrollo

Trabajar siempre por casos de uso.

Ejemplo:

Income

- RegisterIncome
- GetIncome
- ListIncome
- UpdateIncome
- DeleteIncome

Pending Payment

- RegisterPendingPayment
- ListPendingPayments
- MarkPendingPaymentAsPaid

Dashboard

- GetDashboard

Evitar implementar múltiples casos de uso en una sola iteración.

---

# Cambios

Antes de modificar código:

1. Entender la arquitectura existente.
2. Reutilizar componentes existentes cuando sea posible.
3. Mantener consistencia con el estilo del proyecto.

No realizar refactors masivos sin haber sido solicitados.

No cambiar nombres públicos sin justificación.

No introducir dependencias nuevas si no son estrictamente necesarias.

---

# Calidad

Todo código nuevo debe:

- Compilar correctamente.
- Mantener compatibilidad con el resto del proyecto.
- Incluir manejo de errores.
- Mantener el mismo estilo del proyecto.

---

# Testing

Cuando sea razonable:

- escribir pruebas para el UseCase
- evitar mocks innecesarios
- probar la lógica de negocio antes que detalles de implementación

---

# Convenciones

Preferir nombres de negocio.

Ejemplo:

RegisterIncome

en lugar de

CreateIncomeRecord

Preferir:

PendingPayment

en lugar de

PendingPaymentEntity

No agregar sufijos innecesarios.

---

# Cuando implementes una funcionalidad

Siempre seguir este proceso:

1. Explicar brevemente el diseño propuesto.
2. Esperar confirmación si el cambio afecta arquitectura.
3. Implementar un único caso de uso.
4. Mantener compatibilidad hacia atrás.
5. Actualizar Swagger si aplica.
6. Actualizar documentación si el comportamiento cambia.

---

# Qué NO hacer

No agregar capas nuevas.

No cambiar la arquitectura existente.

No mover archivos sin necesidad.

No optimizar código que no presenta problemas.

No hacer refactors estéticos.

No introducir Event Driven Architecture, Pub/Sub o procesos asíncronos salvo que sean solicitados explícitamente.

---

# Definición de terminado

Una tarea se considera terminada cuando:

- El caso de uso funciona.
- El endpoint REST responde correctamente.
- Firestore persiste correctamente la información.
- Swagger está actualizado.
- El código mantiene el estilo del proyecto.