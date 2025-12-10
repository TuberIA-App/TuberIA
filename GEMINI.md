3c) Identificación de permisos, autorizaciones y legislación (Criterio 3c)
Objetivo: Analizar qué legislación debe cumplir la aplicación para poder operar legalmente.

Tareas:

Protección de datos - RGPD:

Si la aplicación recoge datos personales de usuarios europeos, debe cumplir el Reglamento General de Protección de Datos (RGPD).
Aspectos a implementar:
Consentimiento explícito: Los usuarios deben aceptar la recogida de sus datos.
Información transparente: Política de privacidad clara y accesible.
Derechos de los usuarios: Acceso, rectificación, supresión, portabilidad de datos.
Seguridad de los datos: Cifrado de contraseñas (bcrypt), comunicaciones HTTPS.
Delegado de Protección de Datos (DPO): Necesario en ciertos casos (empresas grandes, tratamiento masivo de datos).
Política de cookies:

Si la aplicación utiliza cookies (sesiones, analytics, publicidad), necesitáis:
Banner de cookies: Informar al usuario y solicitar consentimiento.
Clasificación de cookies: Técnicas, de personalización, analíticas, publicitarias.
Gestión de preferencias: Permitir al usuario aceptar/rechazar cookies no esenciales.
Condiciones de uso y términos de servicio:

Documento legal que establece:
Qué pueden y no pueden hacer los usuarios.
Limitaciones de responsabilidad.
Propiedad intelectual del contenido.
Causas de suspensión de cuenta.
Accesibilidad web:

En muchos países (incluida España), las webs públicas y de empresas deben cumplir criterios de accesibilidad.
Norma de referencia: WCAG 2.1 (Web Content Accessibility Guidelines).
Aspectos a tener en cuenta:
Contraste de colores adecuado.
Navegación por teclado.
Etiquetas alt en imágenes.
Estructura semántica correcta (HTML5).
Compatibilidad con lectores de pantalla.
Propiedad intelectual:

Si usáis imágenes, iconos, fuentes o cualquier recurso de terceros:
Verificad que tenéis licencia de uso.
Usad recursos con licencias libres (Creative Commons, iconos de Font Awesome, etc.).
Si integráis APIs externas, revisad sus términos de servicio.
Normativa específica del sector:

Dependiendo del tipo de aplicación, puede haber normativas adicionales:
E-commerce: Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), devoluciones, derecho de desistimiento.
Salud: Si manejáis datos de salud, regulación muy estricta (HIPAA en EE.UU., normativa específica en cada país).
Finanzas: Si procesáis pagos, normativas PCI-DSS, licencias de entidad de pago.
Contenido generado por usuarios: Moderación de contenido, responsabilidad por contenido ilícito.
Permisos y autorizaciones:

¿Necesitáis algún permiso específico para operar?
Ejemplo: Si ofrecéis servicios educativos, puede haber regulación específica.
¿Necesitáis registros oficiales?
Ejemplo: Alta en el Registro de Protección de Datos si procesáis datos sensibles.
Implementación técnica de cumplimiento legal:

Política de privacidad: Cread una página /legal/privacidad con el texto legal.
Política de cookies: Cread una página /legal/cookies y un banner que se muestre al entrar.
Términos de uso: Cread una página /legal/terminos.
Checkbox de aceptación: En formularios de registro, incluir checkbox de aceptación de políticas.
Gestión de datos personales: Implementad endpoints para que los usuarios puedan:
Ver sus datos (exportación JSON).
Solicitar borrado de cuenta (eliminación de datos).
Documentación:

Cread un documento /docs/legislacion.md en vuestro repositorio.
Incluid:
Listado de normativas aplicables a vuestro proyecto.
Requisitos específicos de cada normativa.
Plan de implementación técnica para cumplir con la legislación.
Borradores o enlaces a las políticas legales (privacidad, cookies, términos).


REVISA EL LEGISLACION.MD Y ELIMINA TODO LO QUE NO PIDA EXPLICITAMENTE ESTE ENUNCIADO, SI FALTA ALGO AÑADELO TAMBIEN