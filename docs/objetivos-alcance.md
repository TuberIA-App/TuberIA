# Fase 3

## 1. Objetivos del proyecto:

### Objetivos SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales).

| Objetivo | Tipo | Descripción SMART |
|----------|------|-------------------|
| 1. Finalizar el desarrollo del MVP en un plazo de 45 días | Temporal / Alcanzable | Se medirá por la publicación en el VPS de una versión funcional que permita registro, seguimiento de canales y generación de resúmenes. |
| 2. Obtener una tasa de éxito del 90% en la generación automática de resúmenes | Medible | Se comprobará mediante pruebas de 100 vídeos reales. Éxito = resumen generado sin errores ni vacíos. |
| 3. Lograr que el tiempo medio de procesamiento por vídeo sea inferior a 2 minutos | Medible / Alcanzable | Se registrará automáticamente en logs y se evaluará en las pruebas de rendimiento. |
| 4. Conseguir que al menos 5 usuarios reales prueben el MVP y completen un formulario de satisfacción | Relevante / Temporal | Se medirá mediante encuestas tras la entrega del MVP y permitirá evaluar la usabilidad. |
| 5. Mantener una disponibilidad del sistema superior al 95% durante las pruebas finales | Medible / Relevante | Se verificará mediante logs y uptime monitors. |

### Objetivos generales del proyecto:

- Desarrollar una plataforma web que permita automatizar la transcripción y el resumen de vídeos de YouTube mediante IA.

- Ofrecer una experiencia de usuario intuitiva, personalizada y eficiente que ahorre tiempo a los usuarios en su consumo de contenido.

- Validar la viabilidad técnica y el interés del público mediante un MVP funcional antes del despliegue completo.

### Medición del éxito del proyecto

● **Métricas técnicas:** Tasa de errores en el backend, tiempo medio de respuesta, porcentaje de tareas completadas correctamente.

● **Métricas funcionales:** Número de vídeos procesados, precisión de los resúmenes, velocidad de notificaciones.

● **Métricas de usuario:** Valoración media superior a 4/5 en encuestas de satisfacción y al menos un 70% de usuarios que usarían la aplicación de nuevo.

## 2. Delimitación del alcance:

### Incluirá:

● Registro e inicio de sesión de usuarios (JWT).

● Seguimiento de canales de YouTube y detección automática de vídeos nuevos.

● Transcripción y resumen mediante modelos de IA conectados por API.

● Panel de usuario con visualización de vídeos resumidos.

● Despliegue completo en VPS con Docker y base de datos MongoDB.

### No incluirá:

● Integración con Telegram o WhatsApp.

● Panel de administración de usuario.

● Planes de suscripción de pago (solo versión gratuita para pruebas en el MVP).

### Posibles ampliaciones futuras:

● Sistema de notificaciones básicas dentro de la plataforma.

● Sistema de sugerencias recomendaciones de canales de YouTube basado en IA.

● Exportación de resúmenes en PDF o TXT.

● Integración con otras plataformas de vídeo o audio (Twitch, Spotify, etc.).

● Notificaciones push o integración con apps móviles.