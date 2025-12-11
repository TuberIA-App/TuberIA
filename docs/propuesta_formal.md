# Propuesta Formal del Proyecto TuberIA

> **Nota:** Este documento contiene la propuesta formal inicial del proyecto. Para la documentación actualizada del proyecto, consulta el [README principal](../README.md) y la [Wiki](../wiki/INDEX.md).

---

## Fases del Proyecto

### [Fase 1: Detección del problema](problema.md)
- Propuesta del proyecto y necesidad detectada
- Investigación con encuestas y análisis de usuarios
- Definición de usuarios objetivo
- Análisis de competencia (Eightify, Notta.ai, Glasp)
- Casos de uso principales

### [Fase 2: Estudio de viabilidad técnica](viabilidad-tecnica.md)
- Arquitectura del sistema planificada
- Stack tecnológico seleccionado
- Pruebas de concepto realizadas
- Diagramas técnicos

### [Fase 3: Definición de objetivos y alcance](objetivos-alcance.md)
- Objetivos SMART del MVP (45 días)
- Métricas de éxito (técnicas, funcionales, usuario)
- Delimitación clara: qué incluye y qué NO incluye el MVP
- Posibles ampliaciones futuras

### [Fase 4: Planificación de recursos](recursos.md)
- Roles del equipo (Website Designer, Frontend Lead, Backend Lead, Database Manager)
- Responsabilidades por módulos
- Stack tecnológico detallado (Frontend: React+Vite, Backend: Node.js+Express)
- APIs y servicios externos (YouTube, OpenRouter, etc.)
- Infraestructura y costes (DigitalOcean VPS con crédito estudiantil)

---

## Resultados de Investigación

Encuesta realizada a 8 usuarios (estudiantes y profesionales):
- **62.5%** desea resúmenes automáticos de vídeos
- **50%** deja vídeos a medias por falta de tiempo
- **75%** pagaría por el servicio (dependiendo del precio)
- **62.5%** valora más la **precisión** de los resúmenes

Evidencia adicional: Análisis de comunidades en Reddit confirmó usuarios usando IA manualmente para resumir vídeos.

Análisis completo en [problema.md](problema.md#2-definición-de-usuarios-objetivo)

---

## Alcance del MVP

**Lo que SÍ incluye el MVP:**
- Autenticación de usuarios (JWT)
- Seguimiento de canales de YouTube
- Detección automática de vídeos nuevos (RSS feeds)
- Transcripción (youtube-transcript-plus)
- Resumen con IA (OpenRouter API)
- Panel de usuario personalizado
- Despliegue en VPS con Docker

**Lo que NO incluye el MVP:**
- Notificaciones push/Telegram/WhatsApp
- Panel de administración avanzado
- Sistema de suscripciones de pago
- Exportación de resúmenes

Detalles completos en [objetivos-alcance.md](objetivos-alcance.md)

---

## Ventaja Competitiva

| Competidor | Su Limitación | Nuestra Ventaja |
|------------|---------------|-----------------|
| Eightify | Requiere acción manual por vídeo | 100% automatizado |
| Notta.ai | Enfocado en archivos locales | Integración directa con YouTube |
| Glasp | Sin IA propia para resúmenes | IA + API de YouTube integradas |

**Propuesta única:** Conexión directa con YouTube (API + RSS) + IA integrada + Automatización completa

Análisis detallado en [problema.md](problema.md#3-análisis-de-competencia)
