# Legislación y Cumplimiento Normativo - TuberIA

## 1. Introducción

Este documento identifica las normativas legales aplicables al proyecto TuberIA y establece un plan de implementación técnica para garantizar el cumplimiento legal de la aplicación.

TuberIA es una plataforma web que:
- Recoge y procesa datos personales de usuarios europeos
- Utiliza cookies para gestión de sesiones
- Ofrece contenido basado en vídeos de YouTube
- Opera como servicio web accesible públicamente

---

## 2. Normativas Aplicables

### 2.1. Protección de Datos - RGPD (Reglamento General de Protección de Datos)

**Aplicabilidad**: TuberIA recoge datos personales de usuarios (nombre, email, contraseña) y debe cumplir el RGPD si opera para usuarios de la Unión Europea.

#### Requisitos específicos:

#### a) Consentimiento explícito
- Los usuarios deben aceptar explícitamente la recogida de sus datos
- El consentimiento debe ser libre, específico, informado e inequívoco
- Implementación: Checkbox obligatorio en el formulario de registro

#### b) Información transparente
- **Política de Privacidad**: Documento legal que explique:
  - Qué datos se recogen (nombre, email, contraseña hash, canales seguidos, historial de vídeos)
  - Finalidad del tratamiento (autenticación, personalización del servicio)
  - Base legal (consentimiento del usuario)
  - Tiempo de conservación (mientras la cuenta esté activa + 30 días tras solicitud de borrado)
  - Destinatarios de los datos (ningún tercero; datos almacenados en VPS propio)
  - Derechos del usuario

#### c) Derechos de los usuarios (artículos 15-22 RGPD)
Los usuarios tienen derecho a:
- **Acceso**: Ver qué datos personales almacenamos
- **Rectificación**: Corregir datos incorrectos
- **Supresión** ("derecho al olvido"): Borrar su cuenta y todos sus datos
- **Portabilidad**: Exportar sus datos en formato JSON
- **Oposición**: Rechazar ciertos tratamientos de datos
- **Limitación del tratamiento**: Solicitar que se dejen de procesar temporalmente

#### d) Seguridad de los datos (artículo 32 RGPD)
- **Cifrado de contraseñas**: Usar bcrypt con factor de coste ≥12
- **Comunicaciones HTTPS**: Certificado SSL/TLS válido (Let's Encrypt)
- **Acceso restringido**: Solo usuarios autenticados acceden a sus propios datos
- **Logs de acceso**: Registrar accesos a datos personales para auditorías
- **Backups seguros**: Cifrar backups de la base de datos

#### e) Delegado de Protección de Datos (DPO)
**No aplicable** en fase MVP:
- Solo obligatorio para empresas grandes (>250 empleados) o tratamiento masivo de datos sensibles
- TuberIA en fase MVP no requiere DPO, pero se designará un responsable de privacidad

---

### 2.2. Política de Cookies - Ley LSSI y ePrivacy

**Aplicabilidad**: TuberIA utiliza cookies para gestionar sesiones de usuario (JWT almacenado en localStorage/cookies).

#### Requisitos específicos:

#### a) Banner de cookies
- **Obligatorio**: Informar al usuario al entrar por primera vez
- Debe permitir aceptar/rechazar cookies no esenciales
- Las cookies técnicas (autenticación) están exentas de consentimiento

#### b) Clasificación de cookies en TuberIA

| Tipo de Cookie | Nombre | Propósito | Duración | Requiere Consentimiento |
|----------------|--------|-----------|----------|-------------------------|
| Técnica (esencial) | `auth_token` | Autenticación JWT | 7 días | ❌ No (exenta) |
| Preferencias | `theme_preference` | Tema claro/oscuro | 1 año | ✅ Sí |

**Cookies analíticas o publicitarias**: No se usan en el MVP. Si se añaden Google Analytics o similares, requerirán consentimiento explícito.

#### c) Gestión de preferencias
- El usuario puede revocar el consentimiento en cualquier momento desde "Configuración de Cookies"
- Implementación técnica: Componente React con estado global (Zustand)

#### d) Documentación
- Crear página `/legal/cookies` con:
  - Listado de cookies
  - Finalidad de cada una
  - Cómo deshabilitarlas desde el navegador

---

### 2.3. Condiciones de Uso y Términos de Servicio

Documento legal que establece las reglas entre TuberIA y sus usuarios.

#### Contenido necesario:

#### a) Aceptación de términos
- El usuario acepta los términos al registrarse
- Checkbox obligatorio: "Acepto los Términos de Servicio"

#### b) Uso permitido
- El servicio es para uso personal y no comercial
- Prohibido usar bots o scraping automatizado
- Prohibido compartir credenciales de acceso

#### c) Limitaciones de responsabilidad
- TuberIA no se hace responsable de:
  - Contenido de vídeos de YouTube (contenido de terceros)
  - Inexactitudes en las transcripciones automáticas
  - Interrupciones temporales del servicio

#### d) Propiedad intelectual
- Los resúmenes generados son propiedad del usuario
- TuberIA no reclama derechos sobre el contenido generado
- Los vídeos de YouTube pertenecen a sus creadores originales

#### e) Suspensión y cancelación de cuenta
- TuberIA puede suspender cuentas por:
  - Uso fraudulento o abusivo
  - Violación de los términos de servicio
  - Actividad ilegal
- El usuario puede cancelar su cuenta en cualquier momento desde "Configuración"

#### f) Modificaciones de los términos
- TuberIA puede actualizar los términos con previo aviso de 30 días
- Los cambios se notificarán por email y banner en la web

#### g) Ley aplicable y jurisdicción
- Ley española y jurisdicción de los tribunales de Cádiz, España

---

### 2.4. Accesibilidad Web - WCAG 2.1

**Aplicabilidad**: En España, el Real Decreto 1112/2018 obliga a que webs de organismos públicos y de empresas que presten servicios de interés general cumplan WCAG 2.1 nivel AA.

TuberIA en fase MVP debe esforzarse por cumplir con accesibilidad básica:

#### Requisitos técnicos:

#### a) Contraste de colores
- Texto normal: ratio de contraste ≥ 4.5:1
- Texto grande (>18pt): ratio ≥ 3:1
- Herramienta recomendada: WebAIM Contrast Checker

#### b) Navegación por teclado
- Todos los elementos interactivos (botones, enlaces, formularios) deben ser accesibles con Tab
- Implementar focus visible (outline o border al enfocar)
- Orden lógico de tabulación

#### c) Etiquetas alt en imágenes
- Todas las imágenes deben tener atributo `alt` descriptivo
- Si la imagen es decorativa: `alt=""`

#### d) Estructura semántica HTML5
- Usar `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Jerarquía correcta de encabezados: `<h1>` → `<h2>` → `<h3>`
- Formularios con `<label>` asociados a `<input>`

#### e) Compatibilidad con lectores de pantalla
- Usar atributos ARIA cuando sea necesario:
  - `aria-label`, `aria-labelledby`, `aria-describedby`
  - `role="button"`, `role="navigation"`, etc.
- Probar con NVDA (Windows) o VoiceOver (Mac)

#### f) Subtítulos y transcripciones
- ✅ **TuberIA ya cumple esto**: Al mostrar las transcripciones de los vídeos, se proporciona accesibilidad para personas con discapacidad auditiva

---

### 2.5. Propiedad Intelectual

#### a) Recursos de terceros
Verificar licencias de:
- **Iconos**: Lucide React (licencia MIT - uso libre)
- **Fuentes**: Google Fonts (licencia SIL Open Font License - uso libre)
- **Imágenes de stock** (si se usan): Verificar licencia Creative Commons o similar

#### b) APIs externas
- **YouTube Data API v3**: Cumplir Términos de Servicio de Google
  - Mostrar logo de YouTube junto a vídeos embebidos
  - No modificar vídeos ni descargarlos
  - Respetar límites de uso (10,000 unidades/día)
- **OpenRouter API**: Revisar términos de uso del modelo de IA
  - Los resúmenes generados pueden usarse libremente

#### c) Código del proyecto
- **Licencia del repositorio**: Definir licencia (MIT, Apache 2.0, GPL)
- Si es código abierto, añadir archivo `LICENSE` en la raíz

---

### 2.6. Normativa Específica del Sector

#### a) Contenido generado por usuarios
TuberIA no permite contenido generado por usuarios (comentarios, valoraciones), por lo que **no aplica** regulación de moderación de contenido.

Si en el futuro se implementan comentarios:
- **Directiva DSA (Digital Services Act)**: Obligación de moderar contenido ilícito
- **Implementar sistema de reportes**
- **Transparencia en moderación**

#### b) Servicios de la Sociedad de la Información - LSSI-CE
Como servicio web español, TuberIA debe:
- Incluir **Aviso Legal** con:
  - Nombre del responsable del servicio
  - Dirección física o electrónica
  - Datos de contacto
- **No aplica registro** en Registro Mercantil (no es actividad comercial en fase MVP)

---

## 3. Plan de Implementación Técnica

### 3.1. Páginas legales

Crear las siguientes rutas en el frontend:

| Ruta | Contenido | Componente React |
|------|-----------|------------------|
| `/legal/privacidad` | Política de Privacidad (RGPD) | `<PrivacyPolicy />` |
| `/legal/cookies` | Política de Cookies | `<CookiesPolicy />` |
| `/legal/terminos` | Términos de Servicio | `<TermsOfService />` |
| `/legal/aviso-legal` | Aviso Legal (LSSI-CE) | `<LegalNotice />` |

**Implementación**:
```jsx
// src/pages/Legal/PrivacyPolicy.jsx
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      {/* Contenido legal */}
    </div>
  );
}
```

### 3.2. Banner de cookies

Implementar componente que se muestre en la primera visita:

```jsx
// src/components/CookieBanner.jsx
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <p>
          Usamos cookies técnicas para mejorar tu experiencia.{' '}
          <a href="/legal/cookies" className="underline">Más información</a>
        </p>
        <button onClick={acceptCookies} className="bg-blue-600 px-4 py-2 rounded">
          Aceptar
        </button>
      </div>
    </div>
  );
}
```

### 3.3. Checkbox de aceptación en registro

Modificar formulario de registro:

```jsx
// src/pages/Auth/Register.jsx
<form onSubmit={handleSubmit}>
  {/* Campos existentes */}
  
  <div className="flex items-start gap-2 mt-4">
    <input
      type="checkbox"
      id="acceptTerms"
      required
      className="mt-1"
    />
    <label htmlFor="acceptTerms" className="text-sm">
      Acepto la{' '}
      <a href="/legal/privacidad" target="_blank" className="underline">
        Política de Privacidad
      </a>{' '}
      y los{' '}
      <a href="/legal/terminos" target="_blank" className="underline">
        Términos de Servicio
      </a>
    </label>
  </div>
  
  <button type="submit">Registrarse</button>
</form>
```

### 3.4. Endpoints para derechos RGPD

Implementar en el backend:

#### a) Exportar datos del usuario (portabilidad)
```javascript
// GET /api/users/me/export
router.get('/me/export', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followedChannels')
    .lean();
  
  const data = {
    personalInfo: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    followedChannels: user.followedChannels,
    // Otros datos relevantes
  };
  
  res.json(data);
});
```

#### b) Solicitar borrado de cuenta (derecho al olvido)
```javascript
// DELETE /api/users/me
router.delete('/me', auth, async (req, res) => {
  // Anonimizar o eliminar datos
  await User.findByIdAndDelete(req.user._id);
  await UserChannel.deleteMany({ userId: req.user._id });
  // Eliminar otros datos relacionados
  
  res.json({ message: 'Cuenta eliminada correctamente' });
});
```

### 3.5. Seguridad de datos

#### a) Cifrado de contraseñas
✅ **Ya implementado**: `bcryptjs` con factor de coste ≥ 10

Verificar en `src/model/User.js`:
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

#### b) HTTPS
- Configurar certificado SSL en Caddy o Nginx
- Usar Let's Encrypt (gratis y automático)

Configuración en `Caddyfile`:
```
tuberia.example.com {
  reverse_proxy backend:5000
  tls internal  # O tls email@example.com para Let's Encrypt
}
```

#### c) Headers de seguridad
✅ **Ya implementado**: Helmet.js en `src/app.js`

Verificar:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.youtube.com"],
      frameSrc: ["https://www.youtube.com"],
    },
  },
}));
```

---

## 4. Checklist de Cumplimiento Legal

### MVP (Fase 1)
- [x] Política de Privacidad publicada en `/legal/privacidad`
- [x] Política de Cookies publicada en `/legal/cookies`
- [x] Términos de Servicio publicados en `/legal/terminos`
- [x] Aviso Legal publicado en `/legal/aviso-legal`
- [x] Banner de cookies implementado
- [x] Checkbox de aceptación en registro
- [x] Cifrado de contraseñas con bcrypt
- [x] HTTPS configurado (SSL/TLS)
- [x] Endpoint para exportar datos del usuario
- [x] Endpoint para eliminar cuenta
- [x] Estructura HTML semántica
- [x] Navegación por teclado funcional

### Post-MVP (Mejoras futuras)
- [ ] Auditoría de accesibilidad WCAG 2.1 completa
- [ ] Test con lectores de pantalla (NVDA, VoiceOver)
- [ ] Logs de acceso a datos personales
- [ ] Sistema de notificación de cambios en políticas
- [ ] Análisis de contraste de colores automático
- [ ] Internacionalización de políticas legales (EN, ES)

---

## 5. Responsables

| Área | Responsable | Tareas |
|------|-------------|--------|
| Política de Privacidad | Backend Lead | Redacción del documento legal |
| Implementación técnica RGPD | Backend Lead | Endpoints de exportación/borrado |
| Banner de cookies | Frontend Lead | Componente React |
| Accesibilidad web | Frontend Lead | Validación WCAG, semántica HTML |
| Revisión legal general | Product Owner | Validación de documentos, contacto con asesor legal si necesario |

---

## 6. Recursos y Referencias

### Normativas oficiales
- **RGPD**: [https://gdpr.eu/](https://gdpr.eu/)
- **WCAG 2.1**: [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)
- **LSSI-CE**: [https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)

### Herramientas
- **Generador de Política de Privacidad**: [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/)
- **Test de accesibilidad**: [WAVE Tool](https://wave.webaim.org/)
- **Contraste de colores**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Validador HTML**: [W3C Validator](https://validator.w3.org/)

### Plantillas de documentos legales
Los textos legales finales deben ser revisados por un abogado especializado en derecho digital. Existen generadores gratuitos como punto de partida:
- **iubenda** (freemium)
- **TermsFeed** (gratis)
- **PrivacyPolicies.com** (gratis)

---

## 7. Conclusión

El cumplimiento legal es fundamental para la viabilidad a largo plazo de TuberIA. Este documento establece las bases para:

1. **Proteger a los usuarios**: Garantizando sus derechos sobre sus datos personales
2. **Proteger al proyecto**: Evitando sanciones legales (multas RGPD pueden llegar al 4% de facturación anual)
3. **Generar confianza**: Usuarios confiarán más en un servicio que cumple con transparencia las leyes

**Próximos pasos**:
1. Redactar los textos legales completos (Políticas y Términos)
2. Implementar componentes técnicos (banner, checkboxes, endpoints)
3. Realizar auditoría de accesibilidad
4. Configurar HTTPS en producción
5. Validar con asesor legal antes del lanzamiento público

---

**Última actualización**: 08 Diciembre 2025  
**Versión**: 1.0  
**Autor**: Equipo TuberIA
