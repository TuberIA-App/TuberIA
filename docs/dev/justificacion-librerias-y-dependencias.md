# Justificación del uso de las librerías y dependencias utilizadas

## Frontend

- **React / React DOM**  
  Base del frontend. Permite construir una SPA basada en componentes reutilizables y un modelo de estado claro, separando presentación y lógica y facilitando el mantenimiento.

- **React Router DOM**  
  Gestiona la navegación entre páginas sin recargar la aplicación, diferenciando rutas públicas y privadas y permitiendo usar componentes como `ProtectedRoute` y layouts específicos.

- **Axios**  
  Cliente HTTP más expresivo que `fetch`, con soporte integrado para interceptores. Facilita centralizar la configuración de cabeceras, manejo de errores y tokens en `api.js` y `api.interceptor.js`, reduciendo código repetido en las páginas.

- **Date-fns**  
  Utilidad para trabajar con fechas (formateo, diferencias, etc.) sin tener que implementar funciones propias. Se usa, por ejemplo, para mostrar fechas de vídeos o resúmenes en un formato legible.

- **React Markdown**  
  Permite renderizar contenido en formato Markdown (por ejemplo, resúmenes o descripciones generadas) de forma segura en componentes React, mejorando la presentación de texto enriquecido.

- **Lucide-react**  
  Librería de iconos ligera y consistente. Aporta iconografía a botones, tarjetas e indicadores sin necesidad de diseñar iconos propios, manteniendo un estilo visual homogéneo.

- **Vite**  
  Herramienta de build y servidor de desarrollo rápida para proyectos React. Mejora la experiencia de desarrollo (hot reload muy rápido) y genera builds optimizadas para producción.

- **ESLint y plugins de React**  
  Se utilizan para mantener una base de código consistente y detectar errores comunes de JavaScript y React, aplicando reglas específicas para hooks y buenas prácticas en componentes.

En conjunto, estas dependencias se han seleccionado para evitar reinventar la rueda (HTTP, fechas, iconos, Markdown) y concentrar el esfuerzo en la lógica de negocio propia de TuberIA, siguiendo buenas prácticas habituales en proyectos React modernos.

## Backend
