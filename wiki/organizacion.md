# Organización del Proyecto TuberIA

## Criterio de Priorización

### Metodología de Priorización Adoptada

Para el proyecto TuberIA, hemos adoptado un **sistema de priorización numérico ascendente** donde:

- **Prioridad 1**: Máxima prioridad - Tareas críticas que bloquean otras o son fundamentales para el funcionamiento del MVP
- **Prioridad 2-3**: Alta prioridad - Tareas importantes para el sprint actual
- **Prioridad 4-5**: Prioridad media - Tareas necesarias pero no urgentes
- **Prioridad 6**: Baja prioridad - Mejoras, optimizaciones o funcionalidades secundarias

### Reglas de Priorización

1. **Una persona = Una prioridad por sprint**: Cada miembro del equipo no puede tener dos tareas con la misma prioridad dentro del mismo sprint. Esto asegura un orden claro de ejecución.

2. **Trabajo secuencial por prioridad**: Los desarrolladores deben trabajar en las tareas ordenadas por prioridad ascendente, completando la tarea de menor número antes de pasar a la siguiente.

3. **Dependencias explícitas**: Las tareas con dependencias de otras siempre tienen prioridad mayor (número más alto) que las tareas de las que dependen.

### Factores que Determinan la Prioridad

Al asignar prioridades, consideramos:

#### 1. **Criticidad técnica**
- ¿Bloquea esta tarea el avance de otras funcionalidades?
- ¿Es parte de la infraestructura base del sistema?

#### 2. **Valor de negocio**
- ¿Es esencial para el MVP (Minimum Viable Product)?
- ¿Tiene impacto directo en la experiencia del usuario?

#### 3. **Dependencias**
- ¿Otras tareas dependen de esta?
- ¿Necesita que otras tareas estén completadas primero?

#### 4. **Riesgo técnico**
- ¿Tiene alta complejidad o incertidumbre?
- ¿Requiere integración con servicios externos?

#### 5. **Urgencia temporal**
- ¿Debe completarse en este sprint específico?
- ¿Hay deadline externo relacionado?

### Ejemplos de Priorización

#### Sprint 1 - Ejemplo de Prioridades:

| Prioridad | Tarea | Justificación |
|-----------|-------|---------------|
| 1 | Configurar estructura base del backend | Bloquea todo el desarrollo backend |
| 2 | Crear modelos de datos en MongoDB | Necesario para cualquier funcionalidad CRUD |
| 3 | Implementar sistema de autenticación JWT | Funcionalidad core del MVP |
| 4 | Configurar Docker Compose | Facilita el desarrollo pero no bloquea |
| 5 | Crear componentes UI base en React | Puede avanzar en paralelo al backend |

### Proceso de Asignación de Prioridades

1. **Sprint Planning Meeting**
   - El Product Owner presenta las tareas del Product Backlog
   - El equipo discute dependencias y complejidad
   - Se asignan prioridades mediante consenso

2. **Revisión de dependencias**
   - Se identifican tareas bloqueantes
   - Se ajustan prioridades para respetar el orden lógico

3. **Distribución equitativa**
   - Se asegura que cada miembro tenga tareas con prioridades únicas
   - Se balancea la carga de trabajo

4. **Documentación en GitHub Projects**
   - Cada issue tiene su campo "Prioridad" actualizado
   - El tablero refleja el orden de ejecución

### Gestión de Cambios en Prioridades

Las prioridades pueden ajustarse durante el sprint solo si:

1. **Bloqueo técnico imprevisto**: Una tarea bloqueada requiere que otra suba en prioridad
2. **Bug crítico**: Se detecta un error que debe resolverse inmediatamente
3. **Cambio en requisitos**: El Product Owner identifica un cambio de alcance crítico

**Cualquier cambio debe**:
- Ser comunicado al equipo completo
- Documentarse en el issue correspondiente
- Revisarse en la Daily Standup
- Ser aprobado por el Scrum Master

### Columnas en GitHub Projects

Nuestro tablero tiene las siguientes columnas que reflejan el flujo de trabajo:

1. **Backlog**: Tareas pendientes de planificar para futuros sprints
2. **To Do**: Tareas del sprint actual, ordenadas por prioridad, listas para comenzar
3. **In Progress**: Tareas actualmente en desarrollo (máximo 1-2 por persona)
4. **In Review**: Tareas completadas con Pull Request abierta, pendiente de revisión de código
5. **Done**: Tareas completadas, revisadas y mergeadas a develop

### Flujo de Trabajo Individual

Para cada desarrollador:

1. Revisar el tablero y seleccionar la tarea asignada con **menor número de prioridad** en "To Do"
2. Mover la tarea a "In Progress"
3. Crear una rama desde `develop`: `git checkout -b feature/nombre-tarea`
4. Desarrollar la funcionalidad
5. Al completar, crear Pull Request y mover a "In Review"
6. Tras aprobación del code review, mergear y mover a "Done"
7. Pasar a la siguiente tarea por orden de prioridad

### Métricas de Seguimiento

Medimos la efectividad de nuestro sistema de priorización mediante:

- **Burn-down chart**: Tareas completadas vs planificadas por día
- **Tareas bloqueadas**: Número de tareas que no pudieron completarse por dependencias mal priorizadas
- **Reordenaciones**: Frecuencia de cambios en prioridades durante el sprint
- **Velocidad del equipo**: Puntos/horas completadas por sprint

El objetivo es minimizar las reordenaciones y maximizar el flujo continuo de trabajo.
