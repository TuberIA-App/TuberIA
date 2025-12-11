# Detalles técnicos de la arquitectura

## Arquitectura Frontend

La parte frontend está construida como una SPA con React. La estructura principal de `src/` es:

- `App.jsx` y `main.jsx`  
  Punto de entrada y montaje de la aplicación. Aquí se inicializa el árbol de rutas y se envuelve la app con los contextos globales necesarios (autenticación, datos de usuario).

- `components/`  
  Componentes reutilizables y de layout.
  - `components/common/`  
    Elementos de UI genéricos (botones, inputs, tarjetas, modales, logo, skip-link, etc.) que se utilizan en varias páginas para mantener una experiencia consistente.
  - `components/Layout/`  
    Componentes de estructura (Header, Footer, MainLayout, PrivateLayout, PublicHeader) que definen el esqueleto visual y diferencian zona pública y zona privada.
  - `components/ChannelItem/` y `components/SearchBar/`  
    Componentes de dominio relacionados con canales y búsqueda, reutilizables en distintas vistas.
  - `components/ProtectedRoute.jsx`  
    Componente que envuelve rutas privadas y verifica el estado de autenticación antes de permitir el acceso.

- `pages/`  
  Vistas principales de la aplicación, cada una con su JSX y su CSS asociado:
  - `Home`, `Auth`, `ChannelSearch`, `Dashboard`, `MyFeedPage`, `UserHome`, `VideoDetail`, etc.
  Cada página orquesta componentes comunes y de dominio, y contiene la lógica específica de esa pantalla (carga de datos, manejo de formularios, navegación, etc.).

- `context/`  
  Contextos globales basados en la Context API de React:
  - `AuthContext.jsx`: gestiona el estado de autenticación (tokens, login/logout, usuario autenticado).
  - `UserDataContext.jsx`: centraliza datos de usuario (por ejemplo, canales seguidos, feed personalizado), evitando pasar props en cadena entre muchos componentes.

- `hooks/`  
  Hooks personalizados que encapsulan lógica reutilizable ligada a React:
  - `useMyFeed.js`: agrupa la lógica para obtener y gestionar el feed del usuario desde distintos componentes, manteniendo los componentes de UI más limpios.

- `services/`  
  Capa de acceso a la API y utilidades HTTP:
  - `api.js` y `api.interceptor.js`: configuración del cliente HTTP e interceptores para añadir tokens, gestionar expiración de sesión, tratar errores comunes, etc.
  - `auth.service.js`, `channel.service.js`, `user.service.js`, `video.service.js`: servicios organizados por dominio que exponen funciones de alto nivel hacia el frontend, ocultando los detalles de las peticiones HTTP y las rutas de la API.

- `styles/`  
  Estilos globales de la aplicación:
  - `globals.css`, `variables.css`: estilos base y sistema de diseño (paleta de colores, fuentes, tamaños).
  - `styles/base/`: reset de estilos del navegador, tipografía y utilidades reutilizables.

El frontend consume una API REST implementada en el backend (Node/Express + MongoDB), que se documenta en la sección de arquitectura de backend.

## Decisiones tomadas Frontend

- Separación por responsabilidad (`pages`, `components`, `services`, `context`, `hooks`)  
  Para evitar componentes demasiado grandes y mezclar lógica de datos con presentación, se ha optado por:
  - `pages/` como contenedores de pantalla que orquestan datos y componentes.
  - `components/` para piezas de interfaz reutilizables y desacopladas de la lógica de acceso a datos.
  - `services/` como capa única de acceso a la API, de forma que los componentes nunca hacen peticiones HTTP directamente.
  - `context/` reservado para estado realmente global (autenticación y datos de usuario) que se comparte entre muchas partes de la app.
  - `hooks/` para encapsular lógica específica de React que se reutiliza en varios componentes (por ejemplo, obtención del feed).

- Rutas públicas y privadas  
  Se utiliza React Router junto con `ProtectedRoute` y los layouts (`PublicHeader`, `PrivateLayout`) para separar claramente:
  - Zona pública: landing, login, registro y páginas de acceso abierto.
  - Zona privada: dashboard, feeds personalizados y detalles de vídeo de usuario.
  Esto permite controlar el acceso en un único punto y mantener la navegación sin recargas de página.

- Capa de servicios e interceptores  
  Se centraliza la configuración HTTP en `services/` y `api.interceptor.js`:
  - Añadiendo automáticamente tokens a las peticiones autenticadas.
  - Gestionando casos de expiración de sesión (por ejemplo, expiración de access token y uso de refresh token).
  - Unificando el manejo de errores de red y de API.
  Gracias a esto, las páginas sólo llaman a funciones de servicio (por ejemplo, `channelService.search(...)`) y no dependen de detalles de implementación de la API.

- Estilos organizados por página y estilos globales  
  - Cada página (`Home.css`, `Dashboard.css`, etc.) tiene su hoja de estilos asociada para controlar el diseño específico de esa vista.
  - Los estilos globales (`globals.css`, `variables.css`, `styles/base/`) definen tipografías, paleta y utilidades comunes para garantizar coherencia visual y facilitar cambios de diseño globales.

- Reutilización de componentes comunes  
  - Botones, inputs, tarjetas, modales y elementos de layout se agrupan en `components/common` y `components/Layout` para:
    - Mantener una experiencia de usuario uniforme.
    - Reducir duplicidad de código y permitir que un cambio de estilo o de comportamiento se aplique a toda la aplicación desde un único sitio.

Estas decisiones se alinean con buenas prácticas habituales en React: separar responsabilidades, mantener los componentes de presentación simples, centralizar el acceso a datos y usar context/hooks sólo cuando aportan claridad y reutilización.