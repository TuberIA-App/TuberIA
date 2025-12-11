# TuberIA - Wiki del Proyecto

## Descripción del Proyecto

**TuberIA** es una plataforma web que utiliza inteligencia artificial para **automatizar completamente** el seguimiento de canales de YouTube. Los usuarios reciben resúmenes estructurados de los nuevos vídeos sin intervención manual.

**El problema:** Estudiantes y profesionales pierden tiempo consumiendo vídeos largos o abandonan canales de interés por exceso de contenido.

**Nuestra solución:** Detección automática + Transcripción + Resumen con IA = Contenido clave en minutos.

---

## Navegación Rápida

| Sección | Descripción |
|---------|-------------|
| [Metodología SCRUM](#metodología-scrum) | Implementación de Scrum en el proyecto |
| [Roles del Equipo](#roles-del-equipo) | Tabla de rotación de roles por sprint |
| [Planificación de Sprints](./objetivos/objetivos.md) | 6 sprints con objetivos y entregables |
| [Organización y Priorización](./organizacion.md) | Criterios de priorización y flujo de trabajo |
| [Gestión de Recursos y Tiempos](./gestion-de-recursos-y-tiempo.md) | GitHub Projects, Toggl Track, ceremonias |
| [Actas de Reuniones](#actas-de-reuniones) | Daily Scrums, Sprint Reviews, Retrospectives |

---

## Metodología SCRUM

### Implementación en TuberIA

El proyecto TuberIA sigue la metodología **Scrum** con las siguientes características:

| Aspecto | Implementación |
|---------|----------------|
| **Duración del Sprint** | 1 semana (7 días) |
| **Número de Sprints** | 6 sprints |
| **Tamaño del Equipo** | 3 personas |
| **Herramienta de Gestión** | GitHub Projects |
| **Seguimiento de Tiempo** | Toggl Track |

### Eventos Scrum

| Evento | Frecuencia | Duración | Canal |
|--------|------------|----------|-------|
| **Daily Standup** | Diario (10:00) | 15 min | Discord |
| **Sprint Planning** | Viernes inicio | 2 horas | Discord/Meet |
| **Sprint Review** | Viernes fin | 1 hora | Discord/Meet |
| **Sprint Retrospective** | Viernes fin | 1 hora | Discord/Meet |

### Artefactos Scrum

- **Product Backlog**: Gestionado en GitHub Projects con todas las historias de usuario
- **Sprint Backlog**: Issues asignados al sprint actual en GitHub Projects
- **Incremento**: Código funcional mergeado a `develop` al final de cada sprint

### Definición de "Done"

Una tarea se considera completada cuando:
1. El código está implementado y funcional
2. Los tests pasan (si aplica)
3. El code review está aprobado
4. El código está mergeado a `develop`
5. La documentación está actualizada (si aplica)
6. El issue está cerrado en GitHub Projects

---

## Roles del Equipo

### Miembros del Equipo

| Miembro | GitHub | Rol Base | Expertise |
|---------|--------|----------|-----------|
| **Ezequiel** | [@obezeq](https://github.com/obezeq) | Backend Lead | Node.js, Express, DevOps |
| **Natalia** | [@Naleper90](https://github.com/Naleper90) | Frontend Lead | React, UI/UX |
| **Alfonso** | [@acasmor0802](https://github.com/acasmor0802) | Database Manager | MongoDB, Frontend |

### Tabla de Rotación de Roles Scrum

Cada miembro rota entre los roles de Product Owner, Scrum Master y Developer:

| Sprint | Product Owner | Scrum Master | Developers |
|--------|---------------|--------------|------------|
| **Sprint 1** | Ezequiel | Alfonso | Natalia |
| **Sprint 2** | Alfonso | Natalia | Ezequiel |
| **Sprint 3** | Natalia | Ezequiel | Alfonso |
| **Sprint 4** | Ezequiel | Alfonso | Natalia |
| **Sprint 5** | Alfonso | Natalia | Ezequiel |
| **Sprint 6** | Natalia | Ezequiel | Alfonso |

### Responsabilidades por Rol

#### Product Owner
- Gestionar y priorizar el Product Backlog
- Definir criterios de aceptación para las historias de usuario
- Validar el trabajo completado en Sprint Review
- Comunicar la visión del producto

#### Scrum Master
- Facilitar las ceremonias Scrum
- Eliminar impedimentos del equipo
- Mantener GitHub Projects actualizado
- Asegurar el cumplimiento de la metodología

#### Developer
- Desarrollar las funcionalidades asignadas
- Participar en code reviews
- Estimar tareas en Planning Poker
- Documentar el código y APIs

---

## Documentación del Proyecto

### FASE 1: Análisis del Sector y Estructura Empresarial

| Criterio | Documento | Descripción |
|----------|-----------|-------------|
| **1a** | [Análisis de Competencia](../docs/analisis-competencia.md) | Clasificación de 5+ empresas del sector |
| **1b** | [Estructura Organizativa](../docs/estructura-organizativa.md) | Organigrama y departamentos |

### FASE 2: Planificación del Proyecto

| Criterio | Documento | Descripción |
|----------|-----------|-------------|
| **2c** | [Planificación de Sprints](./objetivos/objetivos.md) | 6 sprints con objetivos medibles |
| **2f** | [Presupuesto Económico](../docs/presupuesto.md) | Estimaciones y costes reales |
| **2g** | [Financiación](../docs/financiacion.md) | Fuentes de financiación |

### FASE 3: Ejecución y Gestión

| Criterio | Documento | Descripción |
|----------|-----------|-------------|
| **3a** | [Organización](./organizacion.md) | Criterios de priorización |
| **3b** | [Organización](./organizacion.md) | Asignación de recursos |
| **3c** | [Legislación](../docs/legislacion.md) | RGPD, cookies, WCAG |
| **3f** | [Recursos](../docs/recursos.md) | Recursos humanos y materiales |
| **3g** | [Presupuesto](../docs/presupuesto.md) | Valoración económica |

---

## Actas de Reuniones

### Sprint Reviews

Documentación de lo completado en cada sprint y validación del Product Owner:

| Sprint | Fecha | Issues Completados | Principales Entregables |
|--------|-------|-------------------|------------------------|
| Sprint 1 | 6 Nov 2025 | 7 issues | Infraestructura Docker, modelos MongoDB, wireframes |
| Sprint 2 | 13 Nov 2025 | 8 issues | Auth JWT, integración YouTube, frontend base |
| Sprint 3 | 20 Nov 2025 | 6 issues | Frontend auth, resumen IA, docs API |
| Sprint 4 | 27 Nov 2025 | 5 issues | Dashboard, búsqueda canales, header/footer |
| Sprint 5 | 4 Dic 2025 | 10 issues | Redis, workers BullMQ, RSS polling, caché |
| Sprint 6 | 11 Dic 2025 | 6 issues | Fixes finales, testing E2E, integración completa |

**Ver detalles completos en:** [Planificación de Sprints](./objetivos/objetivos.md)

### Sprint Retrospectives

Formato utilizado: **Start-Stop-Continue**

#### Resumen de Retrospectivas

| Sprint | Start (Empezar) | Stop (Dejar) | Continue (Seguir) |
|--------|-----------------|--------------|-------------------|
| Sprint 1 | Documentar APIs desde el inicio | Commits sin mensaje descriptivo | Docker para desarrollo |
| Sprint 2 | Pair programming para features complejas | Merge sin code review | Comunicación diaria en Discord |
| Sprint 3 | Testing antes de mergear | PRs con cambios muy grandes | Estimaciones con Planning Poker |
| Sprint 4 | Crear issues para bugs encontrados | Trabajar en varias tareas a la vez | Revisión de código detallada |
| Sprint 5 | Documentar decisiones técnicas | Dejar tareas incompletas al fin de sprint | Reuniones cortas y efectivas |
| Sprint 6 | Validar con usuario antes de cerrar | Optimización prematura | Priorización clara de tareas |

### Daily Standups

Los Daily Standups se realizan diariamente a las 10:00 en Discord. Cada miembro responde:

1. **¿Qué hice ayer?**
2. **¿Qué haré hoy?**
3. **¿Tengo algún impedimento?**

**Registro de impedimentos significativos:**

| Fecha | Impedimento | Resolución |
|-------|-------------|------------|
| 4 Nov | Docker compose no levantaba MongoDB | Configurar volúmenes correctamente |
| 10 Nov | youtube-transcript-plus fallaba con algunos vídeos | Implementar fallback y manejo de errores |
| 18 Nov | Conflictos de merge en frontend | Establecer convención de branches |
| 25 Nov | Rate limiting de OpenRouter | Implementar cola de procesamiento |
| 2 Dic | Redis no persistía datos | Configurar AOF persistence |

---

## Enlaces Útiles

- **Repositorio:** [https://github.com/TuberIA-App/TuberIA](https://github.com/TuberIA-App/TuberIA)
- **GitHub Projects:** [https://github.com/orgs/TuberIA-App/projects/1](https://github.com/orgs/TuberIA-App/projects/1)
- **Aplicación desplegada:** [https://tuberia.duckdns.org](https://tuberia.duckdns.org)
- **Documentación técnica:** [/docs/dev/README.md](../docs/dev/README.md)

---

[**Volver al README principal**](../README.md)
