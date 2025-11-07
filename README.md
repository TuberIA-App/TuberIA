# TuberIA - Plataforma de Resúmenes Automáticos de YouTube con IA

![Status](https://img.shields.io/badge/status-planificación-orange)

> **Proyecto en fase de planificación** - Documentación completa, desarrollo por comenzar.

---

## 🎯 ¿Qué es TuberIA?

TuberIA es una plataforma web que utiliza inteligencia artificial para **automatizar completamente** el seguimiento de canales de YouTube. Los usuarios reciben resúmenes estructurados de los nuevos vídeos sin intervención manual.

**El problema:** Estudiantes y profesionales pierden tiempo consumiendo vídeos largos o abandonan canales de interés por exceso de contenido.

**Nuestra solución:** Detección automática + Transcripción + Resumen con IA = Contenido clave en minutos.

---

## 📚 Documentación del Proyecto

Toda la documentación está organizada en el directorio [`docs/`](docs/):

### 📋 [Fase 1: Detección del problema](docs/problema.md)
- Propuesta del proyecto y necesidad detectada
- Investigación con encuestas y análisis de usuarios
- Definición de usuarios objetivo
- Análisis de competencia (Eightify, Notta.ai, Glasp)
- Casos de uso principales

### 🔧 [Fase 2: Estudio de viabilidad técnica](docs/viabilidad-tecnica.md)
- Arquitectura del sistema planificada
- Stack tecnológico seleccionado
- Pruebas de concepto realizadas
- Diagramas técnicos

### 🎯 [Fase 3: Definición de objetivos y alcance](docs/objetivos-alcance.md)
- Objetivos SMART del MVP (45 días)
- Métricas de éxito (técnicas, funcionales, usuario)
- Delimitación clara: qué incluye y qué NO incluye el MVP
- Posibles ampliaciones futuras

### 👥 [Fase 4: Planificación de recursos](docs/recursos.md)
- Roles del equipo (Website Designer, Frontend Lead, Backend Lead, Database Manager)
- Responsabilidades por módulos
- Stack tecnológico detallado (Frontend: React+Vite, Backend: Node.js+Express)
- APIs y servicios externos (YouTube, OpenRouter, etc.)
- Infraestructura y costes (DigitalOcean VPS con crédito estudiantil)

---

## 🚀 Alcance del MVP

**Lo que SÍ incluye el MVP:**
- ✅ Autenticación de usuarios (JWT)
- ✅ Seguimiento de canales de YouTube
- ✅ Detección automática de vídeos nuevos (RSS feeds)
- ✅ Transcripción (youtube-transcript-plus)
- ✅ Resumen con IA (OpenRouter API)
- ✅ Panel de usuario personalizado
- ✅ Despliegue en VPS con Docker

**Lo que NO incluye el MVP:**
- ❌ Notificaciones push/Telegram/WhatsApp
- ❌ Panel de administración avanzado
- ❌ Sistema de suscripciones de pago
- ❌ Exportación de resúmenes

📖 Detalles completos en [objetivos-alcance.md](docs/objetivos-alcance.md)

---

## 🏗️ Stack Tecnológico

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Estado:** Zustand + TanStack Query
- **Routing:** React Router DOM

### Backend
- **Runtime:** Node.js + Express
- **Base de datos:** MongoDB + Mongoose
- **Colas:** Redis + Bull
- **Autenticación:** JWT + bcryptjs

### Infraestructura
- **Hosting:** DigitalOcean Droplet (cubierto con crédito estudiantil)
- **Despliegue:** Docker + Docker Compose
- **Proxy:** Nginx + SSL (Let's Encrypt)
- **CDN:** Cloudflare (Free Tier)

### APIs Externas
- YouTube RSS Feeds (gratis, ilimitado)
- youtube-transcript-plus (gratis, testado hasta 1000 req/min)
- OpenRouter API (modelo gratuito + fallback de pago)
- YouTube Data API v3 (10,000 unidades/día gratis)

📖 Especificaciones técnicas completas en [recursos.md](docs/recursos.md) y [viabilidad-tecnica.md](docs/viabilidad-tecnica.md)

---

## 👥 Equipo

| Rol | Responsabilidades Clave |
|-----|-------------------------|
| **Website Designer** | Wireframes, prototipos, UX/UI, coherencia visual |
| **Frontend Lead** | Componentes React, integración API, rendimiento |
| **Backend Lead** | API REST, autenticación, procesamiento IA, seguridad |
| **Database Manager** | Modelos de datos, optimización, backups, escalabilidad |

**Comunicación:** Discord (diaria) + GitHub Issues/PRs (documentación técnica) + Reuniones semanales

📖 Distribución detallada de responsabilidades en [recursos.md](docs/recursos.md#1-recursos-humanos)

---

## 📅 Estado Actual

### ✅ Fase de Planificación (Completada)
- [x] Investigación y validación del problema
- [x] Definición de usuarios objetivo
- [x] Análisis de competencia
- [x] Objetivos SMART del MVP
- [x] Diseño de arquitectura técnica
- [x] Selección de stack tecnológico
- [x] Definición de roles del equipo
- [x] Análisis de costes y recursos

### ⏳ Próximos 45 días (MVP)
- [ ] Setup inicial del proyecto (repos, Docker, CI/CD)
- [ ] Desarrollo del backend (API + autenticación)
- [ ] Desarrollo del frontend (UI + panel)
- [ ] Integración YouTube + IA
- [ ] Testing y optimización
- [ ] Despliegue en VPS
- [ ] Pruebas con usuarios reales (≥5 usuarios)

---

## 📊 Resultados de Investigación

Encuesta realizada a 8 usuarios (estudiantes y profesionales):
- **62.5%** desea resúmenes automáticos de vídeos
- **50%** deja vídeos a medias por falta de tiempo
- **75%** pagaría por el servicio (dependiendo del precio)
- **62.5%** valora más la **precisión** de los resúmenes

Evidencia adicional: Análisis de comunidades en Reddit confirmó usuarios usando IA manualmente para resumir vídeos.

📖 Análisis completo en [problema.md](docs/problema.md#2-definición-de-usuarios-objetivo)

---

## 🆚 Ventaja Competitiva

| Competidor | Su Limitación | Nuestra Ventaja |
|------------|---------------|-----------------|
| Eightify | Requiere acción manual por vídeo | 100% automatizado |
| Notta.ai | Enfocado en archivos locales | Integración directa con YouTube |
| Glasp | Sin IA propia para resúmenes | IA + API de YouTube integradas |

**Propuesta única:** Conexión directa con YouTube (API + RSS) + IA integrada + Automatización completa

📖 Análisis detallado en [problema.md](docs/problema.md#3-análisis-de-competencia)

---

**TuberIA** | Proyecto en fase de planificación | 2025 | Equipo 1 | 2ºDAW
