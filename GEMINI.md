Frontend - Implement Dynamic Video Detail View and Fix Channel Summary Display
Objetivos y acciones:
Asegurar que los usuarios puedan ver correctamente los resúmenes existentes en la página "Mis Canales" (/home) y acceder al contenido completo de un resumen específico desde su enlace de detalle (/video/:id). Actualmente, ambas páginas muestran datos incorrectos o placeholders, rompiendo el flujo principal de la aplicación y la capacidad de descubrir contenido.

Acciones siguientes:
Para la ruta /home (Mis Canales):
Revisar y corregir la lógica de obtención de datos en la ruta /home para que agrupe los resúmenes por canal.
Modificar el componente de la página "Mis Canales" para que renderice la lista de resúmenes correspondiente a cada canal en lugar del mensaje de "no hay resúmenes".
Para la ruta /video/:id (Vista de detalle):
Implementar la lógica en la ruta dinámica /video/:id para capturar el id del video desde la URL.
Crear/modificar la llamada a la API para obtener los detalles del video y su resumen usando el id proporcionado.
Actualizar el componente de la vista de detalle para renderizar dinámicamente el título, thumbnail y el resumen obtenidos, eliminando el contenido estático.
Validación final:
Probar el flujo completo de navegación desde el dashboard hasta la vista de detalle del video.
Acceptance Criteria:
Al visitar /home (Mis Canales), cada canal con resúmenes los muestra correctamente organizados.
Al hacer clic en "Ver resumen" en cualquier card, se navega a la página /video/[id] y se muestra el resumen y los detalles correctos de ese video.
La URL en el navegador refleja correctamente el ID del video que se está visualizando.
Canales sin resúmenes siguen mostrando el mensaje correspondiente.

SI NECESITAS LA API KEY PIDELA, RECUERDA DESCARGAR EL .ENV Y OTRAS DEPENDENCIAS PARA PROBAR
