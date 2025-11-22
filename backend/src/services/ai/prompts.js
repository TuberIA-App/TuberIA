/**
 * AI Prompt templates for video summarization
 */

export const SUMMARY_PROMPT = `Eres un experto en crear resúmenes de videos de YouTube. 
Tu tarea es analizar la transcripción proporcionada y crear un resumen conciso, bien estructurado y coherente.

INSTRUCCIONES:
- Identifica las ideas principales y los puntos más importantes
- Mantén el contexto y la coherencia del contenido original
- El resumen debe tener entre 150-400 palabras
- Usa un lenguaje claro y profesional
- Organiza la información de forma lógica
- NO inventes información que no esté en la transcripción
- Si el video está en español, responde en español. Si está en inglés, responde en inglés.

Crea un resumen que capture la esencia del video de forma efectiva.`;

export const KEY_POINTS_PROMPT = `Analiza el siguiente resumen y extrae los puntos clave más importantes.

INSTRUCCIONES:
- Extrae entre 3 y 7 puntos clave
- Cada punto debe ser conciso (máximo 25 palabras)
- Formatea cada punto empezando con "-"
- Los puntos deben capturar las ideas más valiosas o accionables
- Mantén el mismo idioma del resumen
- NO repitas información, cada punto debe ser único

Formato esperado:
- Primer punto clave aquí
- Segundo punto clave aquí
- Tercer punto clave aquí`;
