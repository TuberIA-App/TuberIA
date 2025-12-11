# Gestión de Recursos y Tiempos - TuberIA

## 1. Introducción

Este documento consolida la planificación de recursos (humanos y materiales) y la gestión de tiempos del proyecto TuberIA, alineándose con la metodología Scrum y las herramientas utilizadas (GitHub Projects y Toggl Track).

**Objetivo**: Asegurar que el proyecto se complete en 6 sprints semanales con una distribución eficiente de recursos y un seguimiento preciso del tiempo invertido.

---

## 2. Configuración de GitHub Projects

### 2.1. URL del proyecto

**Tablero principal**: https://github.com/orgs/TuberIA-App/projects/1

### 2.2. Campos personalizados obligatorios

Para garantizar una gestión efectiva, cada issue en GitHub Projects debe tener los siguientes campos:

| Campo | Tipo | Valores posibles | Propósito |
|-------|------|------------------|-----------|
| **Sprint** | Select | Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 5, Sprint 6 | Identificar a qué iteración pertenece la tarea |
| **Prioridad** | Number | 1 (máxima) a 3 (baja) | Determinar el orden de ejecución dentro del sprint |
| **Estimación (horas)** | Number | 1, 2, 3, 4, 5, 8, 13, 21 | Horas estimadas ANTES de comenzar |
| **Horas Reales** | Number | 4, 5, 8 | Horas realmente invertidas (extraídas de Toggl Track) |
| **Categoría** | Select | Frontend, Backend, BD, DevOps, Testing, Documentación | Tipo de trabajo técnico |
| **Estado** | Status | To Do, In Progress, In Review, Done | Fase del flujo de trabajo |
| **Asignado a** | Assignee | obezeq, acasmor, naleper | Persona responsable de la tarea |

---

## 3. Planificación de Tiempos

### 3.1. Calendario de Sprints

El proyecto TuberIA se desarrolla en **6 sprints de 1 semana** cada uno:

| Sprint | Fechas | Días laborables | Horas disponibles por persona* | Objetivo principal |
|--------|--------|-----------------|--------------------------------|-------------------|
| Sprint 1 | 31 Oct - 06 Nov 2025 | 5 días | ~12 horas | Configuración de infraestructura, modelos de BD, diseño inicial |
| Sprint 2 | 07 Nov - 13 Nov 2025 | 5 días | ~12 horas | Autenticación completa, frontend inicial, mockups |
| Sprint 3 | 14 Nov - 20 Nov 2025 | 5 días | ~12 horas | JWT frontend, búsqueda de canales, preparación deployment |
| Sprint 4 | 21 Nov - 27 Nov 2025 | 5 días | ~12 horas | Frontend dashboard, header, footer, página de vídeo |
| Sprint 5 | 28 Nov - 04 Dic 2025 | 5 días | ~12 horas | Redis, Workers, RSS polling, frontend avanzado, testing |
| Sprint 6 | 05 Dic - 11 Dic 2025 | 5 días | ~12 horas | Fixes finales, testing E2E, documentación, demo |

**\*Asumiendo 2 horas/día por persona** (considerando que es un proyecto académico con otras asignaturas)

### 3.2. Cálculo de la velocidad del equipo

La **velocidad** es la suma de horas completadas por sprint, y permite predecir cuánto trabajo puede asumir el equipo en sprints futuros.

**Fórmula**:
```
Velocidad del Sprint N = Σ (Horas Reales de tareas en "Done")
```

**Ejemplo** (equipo de 3 personas):
- Sprint 1 completado: 40 horas reales
- Sprint 2 completado: 33 horas reales
- **Velocidad promedio**: (40 + 33) / 2 = 36.5 horas
- **Planificación Sprint 3**: No planificar más de 37 horas de tareas

**Seguimiento en cada Sprint Review**:
El Scrum Master presenta una gráfica de velocidad:
```
Sprint | Horas estimadas | Horas reales | Desviación
-------|-----------------|--------------|------------
   1   |      28         |     26       |   -1%
   2   |      16         |     14       |   -1.1%
   3   |      11         |     12       |    0.9%
   4   |      8         |     8       |    0%
   5   |      55         |     58       |    0.9%
   6   |      19         |     23       |    0.8%
```

### 3.3. Buffer de tiempo para imprevistos

Cada sprint debe incluir un **buffer del 15-20%** para:
- Bugs inesperados
- Tareas que toman más tiempo del estimado
- Code reviews más largas de lo previsto
- Reuniones no planificadas

**Ejemplo de planificación de Sprint 3**:
- Capacidad teórica: 30 horas (3 personas × 10 horas)
- Buffer (20%): 6 horas
- **Capacidad planificada**: 24 horas de tareas

### 3.4. Gestión de riesgos temporales

#### Identificación de tareas de alto riesgo

Factores que aumentan el riesgo de retraso:

| Factor de riesgo | Indicador | Mitigación |
|------------------|-----------|------------|
| Alta complejidad técnica | Estimación >6 horas | Dividir en subtareas más pequeñas (<5h) |
| Dependencia de API externa | Requiere respuesta de YouTube/OpenRouter | Implementar mocks para testing en paralelo |
| Tarea bloqueante | Otras 3+ tareas dependen de ella | Asignar prioridad 1 |
| Primera vez implementando | Tecnología nueva para el equipo | Pair programming |
| Requiere diseño previo | UX/UI no definido | Design sprint antes del Sprint Planning |

#### Acciones preventivas:

1. **Identificar dependencias en Sprint Planning**:
   - Asignar prioridad más alta

2. **Daily Standups enfocados en impedimentos**:
   - "¿Hay algo que te bloquea?" → Resolver

3. **Revisión mid-sprint** (domingo de cada semana):
   - ¿Vamos a completar todo lo planificado?

---

## 4. Recursos Humanos

### 4.1. Composición del equipo

| Rol base | Miembro | Experiencia |
|----------|---------|-------------|
| Frontend Lead | Natalia (Naleper90) | React |
| Backend Lead | Ezequiel (obezeq) | Node.js, Express |
| Database Manager | Alfonso (acasmor0802) | MongoDB |

### 4.2. Rotación de roles Scrum

Ver tabla completa en `/docs/recursos.md` (sección 4. Recursos humanos).

**Principio**: Cada miembro debe haber sido Product Owner, Scrum Master y Developer al menos una vez durante los 6 sprints.

**Responsabilidades clave por rol**:

#### Product Owner
- **Pre-sprint**: Refinar Product Backlog, escribir historias de usuario con criterios de aceptación
- **Durante sprint**: Aclarar requisitos, validar avances incrementales
- **Post-sprint**: Aceptar/rechazar historias completadas en Sprint Review

#### Scrum Master
- **Pre-sprint**: Analizar métricas del sprint anterior, preparar Sprint Planning
- **Durante sprint**: Facilitar Daily Standups, actualizar tablero, eliminar impedimentos
- **Post-sprint**: Organizar Sprint Review y Sprint Retrospective

#### Developer
- **Pre-sprint**: Participar en estimaciones (Planning Poker)
- **Durante sprint**: Desarrollar, hacer code reviews, testing, documentación
- **Post-sprint**: Preparar demo de funcionalidades completadas

### 4.3. Comunicación y ceremonias Scrum

#### Daily Standup (15 min, cada mañana a las 10:00)

**Formato**:
Cada miembro responde:
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Tengo algún impedimento?

**Canal**: Discord (canal `#daily-standup`)

**Registro**: El Scrum Master toma notas y actualiza el tablero

#### Sprint Planning (viernes inicio de sprint, 2 horas)

**Agenda**:
1. **Parte 1 (1h)**: ¿Qué vamos a hacer?
   - Product Owner presenta historias de usuario priorizadas
   - Equipo selecciona tareas para el sprint (hasta llenar la capacidad)
2. **Parte 2 (1h)**: ¿Cómo lo vamos a hacer?
   - Dividir historias en tareas técnicas
   - Estimar cada tarea usando Planning Poker
   - Asignar responsables

**Resultado**: Sprint Backlog completo en GitHub Projects

#### Sprint Review (viernes fin de sprint, 1 hora)

**Agenda**:
1. **Demo** (30 min): Cada developer muestra funcionalidades completadas
2. **Validación** (20 min): Product Owner acepta/rechaza según criterios de aceptación
3. **Feedback** (10 min): Equipo discute posibles mejoras

#### Sprint Retrospective (viernes fin de sprint, 1 hora)

**Formato**: Start-Stop-Continue

| Start (empezar a hacer) | Stop (dejar de hacer) | Continue (seguir haciendo) |
|------------------------|----------------------|----------------------------|
| Ej: Más pair programming | Ej: Commits sin mensajes descriptivos | Ej: Code reviews detalladas |

**Resultado**: 2-3 acciones concretas para mejorar en el próximo sprint

---

## 5. Recursos Materiales

Ver sección completa en `/docs/recursos.md` (secciones 2 y 5).

### 5.1. Infraestructura (resumen)

| Recurso | Proveedor | Capacidad | Coste mensual |
|---------|-----------|-----------|---------------|
| VPS (servidor) | DigitalOcean | 1 vCPU, 2GB RAM, 50GB SSD | $12 (cubierto por crédito) |
| Base de datos | MongoDB (self-hosted) | 10GB | $0 |
| Colas | Redis (self-hosted) | 512MB | $0 |

### 5.2. APIs externas (límites)

| API | Límite gratuito | Consumo estimado/día | Riesgo de superación |
|-----|-----------------|----------------------|---------------------|
| YouTube RSS Feeds | Ilimitado | ~500 requests | ❌ Ninguno |
| youtube-transcript-plus | Ilimitado* | ~50 vídeos | ⚠️ Bajo (usar rate limiting) |
| OpenRouter (Z.AI GLM 4.5 Air) | Limitado por cuota | ~50 resúmenes | ⚠️ Medio (usar modelo de pago de backup) |

### 5.3. Herramientas de desarrollo

| Herramienta | Propósito | Coste |
|-------------|-----------|-------|
| GitHub | Repositorio, CI/CD, Projects | $0 (plan educativo) |
| Toggl Track | Seguimiento de tiempo | $0 (plan gratuito) |
| Discord | Comunicación del equipo | $0 |
| Bitwarden | Gestor de contraseñas | $0 (plan educativo) |
| VS Code | IDE | $0 |
| Postman | Testing de APIs | $0 |

---

## 6. Integración Toggl Track + GitHub Projects

### 6.1. Flujo de trabajo completo

```
1. INICIO DE TAREA
   ├─ GitHub Projects: Mover issue de "To Do" → "In Progress"
   ├─ Toggl Track: Iniciar timer con nombre "#123 - Implementar auth JWT"
   └─ Tag en Toggl: Añadir categoría (backend, frontend, etc.)

2. DURANTE EL TRABAJO
   ├─ Toggl Track: Pausar timer si hay interrupciones
   ├─ GitHub: Añadir comentario cada ~2 horas con progreso
   └─ Git: Commits frecuentes con mensajes descriptivos

3. FIN DE TAREA
   ├─ Toggl Track: Detener timer
   ├─ Toggl Track: Exportar tiempo total (ej: 5 horas)
   ├─ GitHub Projects: Actualizar campo "Horas Reales" = 5
   ├─ Git: Push de código, abrir Pull Request
   └─ GitHub Projects: Mover issue a "In Review"

4. CODE REVIEW
   ├─ Otro developer: Revisar código en GitHub
   ├─ Si aprobado: Merge a develop
   └─ GitHub Projects: Mover issue a "Done"
```

### 6.2. Comandos útiles de Toggl Track

**CLI de Toggl (opcional, para automatización)**:
```bash
# Iniciar timer
toggl start "Fix bug #456" --tag backend

# Detener timer
toggl stop

# Ver resumen semanal
toggl report --week
```
---

## 7. Métricas de Éxito

### 7.1. KPIs del proyecto

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Velocity estabilizada** | ≥90% de tareas completadas por sprint | GitHub Projects - issues en "Done" |
| **Precisión de estimaciones** | Desviación ≤20% entre estimado y real | Toggl Track vs. campo "Estimación" |
| **Cobertura de tests** | ≥70% del backend | Jest/Vitest coverage report |
| **Code review time** | ≤24 horas desde PR abierta hasta merge | GitHub PR metrics |
| **Bugs en producción** | 0 bugs críticos, ≤5 bugs menores | Issues con label `bug` |
| **Burnout** | 0 sprints con >110% de capacidad | Horas reales por persona ≤22h/semana |

---