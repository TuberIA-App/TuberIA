# TuberIA App Wiki - Organización

## Navegación:
- [**HOME - Wiki**](./INDEX.md)

---

## 3a) Secuenciación y priorización de actividades

### Criterio de Priorización

#### Metodología de Priorización Adoptada

Para el proyecto TuberIA, hemos adoptado un **sistema de priorización numérico ascendente** donde:

- **Prioridad 1**: Máxima prioridad - Tareas críticas que bloquean otras o son fundamentales para el funcionamiento del MVP
- **Prioridad 2**: prioridad media - Tareas necesarias pero no urgentes
- **Prioridad 3**: Baja prioridad - Mejoras, optimizaciones o funcionalidades secundarias

#### Reglas de Priorización

2. **Trabajo secuencial por prioridad**: Los desarrolladores deben trabajar en las tareas ordenadas por prioridad ascendente, completando la tarea de menor número antes de pasar a la siguiente.

3. **Dependencias explícitas**: Las tareas con dependencias de otras siempre tienen prioridad mayor (número más alto) que las tareas de las que dependen.

#### Factores que Determinan la Prioridad

Al asignar prioridades, consideramos:

##### 1. **Criticidad técnica**
- ¿Bloquea esta tarea el avance de otras funcionalidades?
- ¿Es parte de la infraestructura base del sistema?

##### 2. **Valor de negocio**
- ¿Es esencial para el MVP (Minimum Viable Product)?
- ¿Tiene impacto directo en la experiencia del usuario?

##### 3. **Dependencias**
- ¿Otras tareas dependen de esta?
- ¿Necesita que otras tareas estén completadas primero?

##### 4. **Riesgo técnico**
- ¿Tiene alta complejidad o incertidumbre?
- ¿Requiere integración con servicios externos?

##### 5. **Urgencia temporal**
- ¿Debe completarse en este sprint específico?
- ¿Hay deadline externo relacionado?

#### Ejemplos de Priorización

##### Sprint 1 - Ejemplo de Prioridades:

| Prioridad | Tarea | Justificación |
|-----------|-------|---------------|
| 1 | Configurar estructura base del backend | Bloquea todo el desarrollo backend |
| 2 | Implementar sistema de autenticación JWT | Funcionalidad core del MVP |
| 3 | Configurar Docker Compose | Facilita el desarrollo pero no bloquea |

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

#### Columnas en GitHub Projects

Nuestro tablero tiene las siguientes columnas que reflejan el flujo de trabajo:

1. **Backlog**: Tareas pendientes de planificar para futuros sprints
2. **To Do**: Tareas del sprint actual, ordenadas por prioridad, listas para comenzar
3. **In Progress**: Tareas actualmente en desarrollo (máximo 1-2 por persona)
4. **In Review**: Tareas completadas con Pull Request abierta, pendiente de revisión de código
5. **Done**: Tareas completadas, revisadas y mergeadas a develop

#### Flujo de Trabajo Individual

Para cada desarrollador:

1. Revisar el tablero y seleccionar la tarea asignada con **menor número de prioridad** en "To Do"
2. Mover la tarea a "In Progress"
3. Crear una rama desde `develop`: `git checkout -b feature/nombre-tarea`
4. Desarrollar la funcionalidad
5. Al completar, crear Pull Request y mover a "In Review"
6. Tras aprobación del code review, mergear y mover a "Done"
7. Pasar a la siguiente tarea por orden de prioridad

#### Métricas de Seguimiento

Medimos la efectividad de nuestro sistema de priorización mediante:

- **Tareas bloqueadas**: Número de tareas que no pudieron completarse por dependencias mal priorizadas
- **Velocidad del equipo**: Puntos/horas completadas por sprint

El objetivo es minimizar las reordenaciones y maximizar el flujo continuo de trabajo.

---

## 3b) Asignación de recursos y logística

### 1. Identificación de perfiles necesarios:
- Frontend: Natalia y Alfonso
- Backend: Ezequiel
- DevOps: Ezequiel y Alfonso
- QA/Testing: Ezequiel y Natalia

Ezequiel: @obezeq
Natalia: @Naleper90
Alfonso: @acasmor0802

## 2. Asignación de tareas en GitHub Projects:
- Planificamos el proyecto con GitHub Projects y cada issue se le asigna principalmente a una persona, para realizar acabo una tarea, feature o bug fix.
- En el sprint planning definimos quien va a hacer cada issue y tenemos en cuenta que este equilibrado con el resto del equipo en la mayoría de lo posible, intentando evitar así, cuellos de botella.

## 3. Estimación de esfuerzo:
- Hemos elegido la técnica de planificación de Planning Poker, la estimación de horas se encuentras si o si en un número fibonacci en el campo "Estimación (horas)" de GitHub Projects. Una vez la tarea ha sido completada, el equipo verifica si efectivamente se ha cumplido en el plazo propuesto, o si por el contrario se ha tardado mas o menos.
- Esta forma de planificar no sería posible sin Toggle Tracker, utilizamos toggle tracker para medir cualquier cosa que hagamos, de esta forma nos podemos permitir tener objetivos específicos y medibles. Para poder realizar un progreso de mejora continua en el proyecto, y poder aprender que ocurre cada semana en el sprint review que realizamos, donde documentamos errores y sus soluciones.
- Si estás interesado en observar el sprint review y planificación de cada objetivo puedes verlo [**AQUÍ**](objetivos/objetivos.md)

## 4. Balanceo de carga
- Siempre se intenta hacer un balanceo de carga en cuanto al trabajo que tiene cada miembro. Además si algún compañero nota un cuello de botella o que para realizar su funcionalidad falta que otro compañero realice cierta funcionalidad, se informa inmediatamente, con su creación de issue de tipo inmediata para que el otro compañero pueda arreglar dicha funcionalidad. De mientras, como hay mas issues asignados, el otro compañero que esta esperando, puede continuar trabajando en otra rama para otro issue.
- Esta organización de balanceo de carga, nos permite, no solo balancear la carga de trabajo entre todo el equipo, sino también ser mas eficientes a la hora de realizar el trabajo.

## 5. Recursos materiales y herramientas:
- Editores de código: Usamos principalmente VS Code, y también nos manejamos mucho con la terminal / shell para ejecutar contenedores de docker, o acceder a logs de cualquier tipo.
- Herramientas de diseño: Se ha utilizado Figma para realizar el [**wireframe**](../design/wireframes/) y el [**mockup**](../design/mockups/)
- Software de pruebas: se ha utilizado Postman para realizar peticiones de API, a la vez que cualquier tipo de test en el backend para testear la funcionalidad de cada endpoint, servicio, o lógica de negocio de la infraestructura del backend.
- Servicios externos: hemos contado con un Droplet (VPS) de DigitalOcean como hemos comentado en ciertas ocasiones en la documentación principal. Y no hemos usado ningún otro tipo de servicio, debido a que somos totalmente independientes con Docker y la dockerización de la base de datos (MongoDB y Redis) que nos permite mantener un entorno seguro, escalable sin depender de cualquier tercero.

---

[**VOLVER AL HOME DE LA WIKI**](./INDEX.md)
