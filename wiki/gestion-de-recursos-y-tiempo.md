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
| **Prioridad** | Number | 1 (máxima) a 6 (baja) | Determinar el orden de ejecución dentro del sprint |
| **Estimación (horas)** | Number | 0.5, 1, 2, 3, 4, 5, 8, 13, 21 | Horas estimadas ANTES de comenzar (Fibonacci para incertidumbre) |
| **Horas Reales** | Number | Valor entero (ej: 4, 5, 8) | Horas realmente invertidas (extraídas de Toggl Track) |
| **Categoría** | Select | Frontend, Backend, BD, DevOps, Testing, Documentación | Tipo de trabajo técnico |
| **Estado** | Status | Backlog, To Do, In Progress, In Review, Done | Fase del flujo de trabajo |
| **Asignado a** | Assignee | @miembro1, @miembro2, etc. | Persona responsable de la tarea |

### 2.3. Columnas del tablero (Board view)

El tablero Kanban está organizado en 5 columnas principales:

1. **Backlog**
   - Tareas identificadas pero no planificadas para el sprint actual
   - El Product Owner revisa y prioriza regularmente
   - Se mueven a "To Do" durante el Sprint Planning

2. **To Do**
   - Tareas del sprint actual, listas para comenzar
   - Ordenadas por prioridad (menor número = mayor urgencia)
   - Límite recomendado: No más de 3 tareas "To Do" por persona

3. **In Progress**
   - Tareas actualmente en desarrollo
   - **Límite WIP (Work In Progress)**: Máximo 1-2 tareas por persona
   - Timer de Toggl Track debe estar activo

4. **In Review**
   - Tareas completadas con Pull Request abierta
   - Esperando code review de al menos 1 compañero
   - Debe incluir enlace al PR en el comentario del issue

5. **Done**
   - Tareas completadas, revisadas y mergeadas a `develop`
   - Se archivan al final de cada sprint
   - Suma de "Horas Reales" se usa para calcular velocidad del equipo

### 2.4. Vistas adicionales recomendadas

- **Vista por Sprint**: Filtro `Sprint = Sprint N` para ver solo tareas de la iteración actual
- **Vista por Persona**: Agrupar por "Asignado a" para ver la carga de trabajo individual
- **Vista de Estimaciones**: Tabla con columnas "Estimación" y "Horas Reales" para análisis de desviaciones

---

## 3. Planificación de Tiempos

### 3.1. Calendario de Sprints

El proyecto TuberIA se desarrolla en **6 sprints de 1 semana** cada uno:

| Sprint | Fechas | Días laborables | Horas disponibles por persona* | Objetivo principal |
|--------|--------|-----------------|--------------------------------|-------------------|
| Sprint 1 | 31 Oct - 06 Nov 2025 | 5 días | ~20 horas | Configuración de infraestructura, modelos de BD, diseño inicial |
| Sprint 2 | 07 Nov - 13 Nov 2025 | 5 días | ~20 horas | Autenticación completa, frontend inicial, mockups |
| Sprint 3 | 14 Nov - 20 Nov 2025 | 5 días | ~20 horas | JWT frontend, búsqueda de canales, preparación deployment |
| Sprint 4 | 21 Nov - 27 Nov 2025 | 5 días | ~20 horas | Frontend dashboard, header, footer, página de vídeo |
| Sprint 5 | 28 Nov - 04 Dic 2025 | 5 días | ~20 horas | Redis, Workers, RSS polling, frontend avanzado, testing |
| Sprint 6 | 05 Dic - 11 Dic 2025 | 5 días | ~20 horas | Fixes finales, testing E2E, documentación, demo |

**\*Asumiendo 4 horas/día por persona** (considerando que es un proyecto académico con otras asignaturas)

**\*\*Sprints 4 y 5** tienen menos días laborables por vacaciones navideñas. Se ajusta la carga de trabajo.

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
   1   |      75         |     68       |   -7 (-9%)
   2   |      70         |     72       |   +2 (+3%)
   3   |      70         |     ??       |    ??
```

### 3.3. Buffer de tiempo para imprevistos

Cada sprint debe incluir un **buffer del 15-20%** para:
- Bugs inesperados
- Tareas que toman más tiempo del estimado
- Code reviews más largas de lo previsto
- Reuniones no planificadas

**Ejemplo de planificación de Sprint 3**:
- Capacidad teórica: 60 horas (3 personas × 20 horas)
- Buffer (20%): 12 horas
- **Capacidad planificada**: 48 horas de tareas

### 3.4. Gestión de riesgos temporales

#### Identificación de tareas de alto riesgo

Factores que aumentan el riesgo de retraso:

| Factor de riesgo | Indicador | Mitigación |
|------------------|-----------|------------|
| Alta complejidad técnica | Estimación >8 horas | Dividir en subtareas más pequeñas (<5h) |
| Dependencia de API externa | Requiere respuesta de YouTube/OpenRouter | Implementar mocks para testing en paralelo |
| Tarea bloqueante | Otras 3+ tareas dependen de ella | Asignar a desarrollador senior, prioridad 1 |
| Primera vez implementando | Tecnología nueva para el equipo | Pair programming, spike técnico previo |
| Requiere diseño previo | UX/UI no definido | Design sprint antes del Sprint Planning |

#### Acciones preventivas:

1. **Identificar dependencias en Sprint Planning**:
   - Marcar tareas bloqueantes en el issue: `🔴 BLOCKER`
   - Asignar prioridad más alta

2. **Daily Standups enfocados en impedimentos**:
   - "¿Hay algo que te bloquea?" → Resolver en <24 horas

3. **Revisión mid-sprint** (miércoles de cada semana):
   - ¿Vamos a completar todo lo planificado?
   - Si no, ¿qué tareas mover de vuelta al Backlog?

---

## 4. Recursos Humanos

### 4.1. Composición del equipo

| Rol base | Miembro | Experiencia | Disponibilidad semanal |
|----------|---------|-------------|------------------------|
| Frontend Lead | Natalia (Naleper90) | React, Tailwind CSS | 20 horas |
| Backend Lead | Ezequiel (obezeq) | Node.js, Express, MongoDB | 20 horas |
| Database Manager | Alfonso (acasmor0802) | MongoDB, Redis, SQL | 20 horas |

**Total**: 60 horas/semana teóricas  
**Real** (con buffer): 48-54 horas/semana

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

#### Sprint Planning (lunes inicio de sprint, 2 horas)

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

**Asistentes**: Todo el equipo + stakeholders (profesores si están disponibles)

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
| CDN | Cloudflare | Ilimitado | $0 |

### 5.2. APIs externas (límites)

| API | Límite gratuito | Consumo estimado/día | Riesgo de superación |
|-----|-----------------|----------------------|---------------------|
| YouTube RSS Feeds | Ilimitado | ~500 requests | ❌ Ninguno |
| youtube-transcript-plus | Ilimitado* | ~50 vídeos | ⚠️ Bajo (usar rate limiting) |
| OpenRouter (Z.AI GLM 4.5 Air) | Limitado por cuota | ~50 resúmenes | ⚠️ Medio (usar modelo de pago de backup) |
| YouTube Data API v3 | 10,000 unidades/día | ~200 unidades | ❌ Ninguno |

**\*Sin límites oficiales, pero susceptible a rate limiting de YouTube**

### 5.3. Herramientas de desarrollo

| Herramienta | Propósito | Coste |
|-------------|-----------|-------|
| GitHub | Repositorio, CI/CD, Projects | $0 (plan educativo) |
| Toggl Track | Seguimiento de tiempo | $0 (plan gratuito) |
| Discord | Comunicación del equipo | $0 |
| 1Password/Bitwarden | Gestor de contraseñas | $0 (plan educativo) |
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

### 6.3. Análisis semanal de desviaciones

Cada viernes en la Sprint Review, el Scrum Master presenta:

**Tabla de análisis por categoría**:
| Categoría | Horas estimadas | Horas reales | Desviación | % |
|-----------|-----------------|--------------|------------|---|
| Frontend | 20 | 23 | +3 | +15% |
| Backend | 25 | 22 | -3 | -12% |
| DevOps | 10 | 15 | +5 | +50% ⚠️ |
| Testing | 8 | 8 | 0 | 0% ✅ |
| **Total** | **63** | **68** | **+5** | **+8%** |

**Conclusiones**:
- ✅ Frontend y Backend dentro del margen aceptable (±20%)
- ⚠️ DevOps superó estimación en 50% → **Acción**: Aumentar estimaciones de tareas DevOps en próximo sprint

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

### 7.2. Gráficas a mantener

El Scrum Master debe actualizar semanalmente:

1. **Burn-down chart del sprint**:
   - Eje X: Días del sprint (lunes a viernes)
   - Eje Y: Horas restantes
   - Línea ideal vs. línea real

2. **Gráfica de velocidad**:
   - Eje X: Sprints (1-6)
   - Eje Y: Horas completadas
   - Comparar con línea de capacidad planificada

3. **Distribución de tiempo por categoría**:
   - Gráfico de pastel: % de horas en Frontend, Backend, DevOps, Testing, Docs

---

## 8. Contingencias

### 8.1. Retraso en un sprint

**Síntomas**:
- A mitad de sprint, <50% de tareas completadas
- Horas reales superan estimación en >30%

**Acciones**:
1. **Reunión de emergencia** (máx. 30 min):
   - Identificar impedimentos principales
   - Priorizar tareas críticas
2. **Reducir alcance del sprint**:
   - Mover tareas de menor prioridad al Backlog
   - Renegociar con Product Owner
3. **Solicitar ayuda**:
   - Pair programming en tareas bloqueadas
   - Consultar con profesores/mentores

### 8.2. Miembro del equipo no disponible

**Escenario**: Enfermedad, emergencia personal

**Plan de contingencia**:
1. **Redistribución de tareas**:
   - En Daily Standup, reasignar issues a otros miembros
   - Priorizar tareas bloqueantes
2. **Ajustar capacidad del sprint**:
   - Reducir horas planificadas proporcionalmente
3. **Documentación actualizada**:
   - Asegurar que cualquiera pueda continuar el trabajo (README, comentarios en código)

### 8.3. API externa caída

**Escenario**: YouTube API o OpenRouter no responden

**Plan de contingencia**:
1. **Usar datos mockeados**:
   - Implementar fixtures con datos de ejemplo
2. **Notificar al equipo**:
   - Crear issue con label `external-dependency-blocked`
3. **Implementar retry con exponential backoff**:
   - 3 reintentos: 1s, 5s, 15s
   - Si falla, encolar para procesamiento posterior

---

## 9. Herramientas de Apoyo

### 9.1. Templates de documentos

**Template de Historia de Usuario**:
```markdown
## [US-001] Como [tipo de usuario], quiero [acción] para [beneficio]

**Criterios de aceptación**:
- [ ] Dado [contexto], cuando [acción], entonces [resultado]
- [ ] Dado [contexto], cuando [acción], entonces [resultado]

**Definición de Done**:
- [ ] Código implementado y commiteado
- [ ] Tests unitarios pasando (coverage >70%)
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Funcionalidad probada en entorno de desarrollo

**Estimación**: 5 horas
**Prioridad**: 2
**Categoría**: Backend
**Sprint**: Sprint 2
```

**Template de Issue Técnico**:
```markdown
## [TASK] Descripción breve de la tarea

**Contexto**:
Explicar por qué es necesaria esta tarea.

**Pasos a seguir**:
1. Paso 1
2. Paso 2
3. Paso 3

**Criterios de aceptación**:
- [ ] Criterio 1
- [ ] Criterio 2

**Dependencias**:
- Depende de #123
- Bloquea #456

**Recursos**:
- Link a documentación relevante
- Ejemplo de código similar
```

### 9.2. Checklist pre-Sprint Planning

- [ ] Product Backlog refinado (historias con criterios de aceptación)
- [ ] Prioridades actualizadas por Product Owner
- [ ] Velocity del sprint anterior calculada
- [ ] Impedimentos del sprint anterior resueltos
- [ ] Métricas de Toggl Track exportadas
- [ ] Retrospective action items del sprint anterior revisados

### 9.3. Checklist pre-Deployment

- [ ] Todos los tests pasando (unitarios + integración)
- [ ] Code coverage ≥70%
- [ ] Sin warnings de Eslint
- [ ] Variables de entorno configuradas en servidor
- [ ] Backups de BD configurados
- [ ] Certificado SSL activo
- [ ] Logs configurados (Winston + PM2)
- [ ] Monitorización de recursos activa (htop, docker stats)

---

## 10. Conclusión

Este documento establece el marco de trabajo para gestionar eficientemente recursos y tiempos en TuberIA. Los elementos clave son:

1. **GitHub Projects** como fuente única de verdad del estado del proyecto
2. **Toggl Track** como herramienta de medición precisa de tiempo
3. **Rotación de roles** para desarrollar habilidades integrales
4. **Ceremonias Scrum** estructuradas para comunicación efectiva
5. **Métricas y KPIs** para mejora continua

**Próxima revisión**: Al finalizar Sprint 3 (mitad del proyecto), para ajustar procesos según aprendizajes.

---

**Última actualización**: 08 Diciembre 2025  
**Responsable**: Scrum Master del sprint actual  
**Versión**: 1.0
