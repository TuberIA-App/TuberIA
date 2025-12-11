# Necesidades de Financiación - TuberIA

**Documento**: Criterio 2g - Análisis de necesidades de financiación y plan propuesto  
**Fecha**: Diciembre 2025  
**Proyecto**: TuberIA - Plataforma SaaS de resúmenes automáticos de vídeos de YouTube con IA

---

## Índice
1. [Identificación de Costes Totales](#1-identificación-de-costes-totales)
2. [Análisis de Fuentes de Financiación](#2-análisis-de-fuentes-de-financiación)
3. [Plan de Financiación Propuesto](#3-plan-de-financiación-propuesto)
4. [Justificación y Estrategia](#4-justificación-y-estrategia)

---

## 1. Identificación de Costes Totales

### 1.1. Costes de Desarrollo (Completado - Fase MVP)

Según el documento [`presupuesto.md`](./presupuesto.md), el desarrollo del MVP ha requerido:

| Concepto | Horas | Coste Unitario | Coste Total |
|----------|-------|----------------|-------------|
| Desarrollo MVP (6 sprints) | 227.05 h | 20 €/h | **4,541 €** |
| **Subtotal Desarrollo MVP** | | | **4,541 €** |

**Desglose temporal**:
- Sprint 1 (Infraestructura): 36h → 720 €
- Sprint 2 (Autenticación): 24h → 480 €
- Sprint 3 (Search Backend): 22h → 440 €
- Sprint 4 (Dashboard): 18h → 360 €
- Sprint 5 (Workers IA): 68h → 1,360 €
- Sprint 6 (Fixes finales): 59.05h → 1,181 €

---

### 1.2. Costes de Infraestructura y Servicios (Año 1)

#### A. Servicios en Producción (Coste Real Actual)

| Servicio | Uso Actual | Coste Mensual | Coste Anual | Estado |
|----------|------------|---------------|-------------|--------|
| **DigitalOcean VPS** | 1 Droplet (2 vCPUs, 2 GB RAM) | 12 €/mes | 144 € | ✅ Activo (crédito educativo) |
| **Dominio tuberia.app** | Registro .app | 15 €/año | 15 € | ✅ Activo (crédito educativo) |
| **OpenRouter API** | Uso para transcripción IA | 10 €/mes | 120 € | ✅ Activo |
| **MongoDB Atlas** | Tier gratuito (512 MB) | 0 €/mes | 0 € | ✅ Suficiente para MVP |
| **Redis Cloud** | Tier gratuito (30 MB) | 0 €/mes | 0 € | ✅ Suficiente para MVP |
| **GitHub** | Plan Team (educativo) | 0 €/mes | 0 € | ✅ Gratuito con GitHub Education |
| **Toggl Track** | Plan Free | 0 €/mes | 0 € | ✅ Suficiente para equipo pequeño |
| **Subtotal Infraestructura Año 1** | | | **279 €** | |

**Nota**: Los costes actuales están cubiertos en gran parte por créditos educativos (DigitalOcean Student Pack). Tras finalizar estudios, estos costes serían reales, pero optimizaremos con escalado inteligente basado en uso real para minimizar gastos iniciales.

#### B. Servicios Necesarios para Escalado (Año 1 - No implementados aún)

| Servicio | Propósito | Coste Mensual Est. | Coste Anual Est. |
|----------|-----------|-------------------|------------------|
| **CDN (Cloudflare Pro)** | Cacheo estático, mejora rendimiento | 20 €/mes | 240 € |
| **Monitorización (Sentry Team)** | Error tracking, performance monitoring | 26 €/mes | 312 € |
| **Email transaccional (SendGrid)** | Notificaciones, recuperación contraseña | 15 €/mes | 180 € |
| **Almacenamiento S3** | Backup de datos, archivos estáticos | 5 €/mes | 60 € |
| **MongoDB Atlas (Shared M10)** | Escalado base de datos | 57 €/mes | 684 € |
| **Redis Enterprise (1 GB)** | Escalado cache y colas | 13 €/mes | 156 € |
| **Subtotal Servicios Adicionales** | | | **1,632 €** | |

**Total Infraestructura Año 1 (con escalado)**: **279 € + 1,632 € = 1,911 €**

---

### 1.3. Costes de Marketing y Lanzamiento

| Concepto | Descripción | Coste Estimado |
|----------|-------------|----------------|
| **Diseño de marca** | Logo profesional, manual de identidad (optimizado con herramientas gratuitas y freelancers low-cost) | 200 € |
| **Landing page profesional** | Rediseño completo con conversión optimizada (usando builders como Webflow o Carrd) | 300 € |
| **Facebook Ads (split testing inicial)** | Campañas SEM con $1,000 en tests A/B para identificar anuncios virales (escalado basado en ROI) | 1,000 € |
| **Redes sociales y boca a oreja** | Content creator orgánico + viralidad en TikTok/YouTube (sin coste inicial, foco en user-generated content) | 0 € |
| **Product Hunt launch** | Preparación y promoción del lanzamiento (comunidad gratuita + influencers) | 100 € |
| **Sistema de afiliados** | Implementación de programa de afiliados para YouTubers (usando herramientas como Rewardful, comisiones por referrals) | 200 € |
| **Herramientas marketing** | Mailchimp, Analytics, Hotjar (6 meses, planes gratuitos iniciales) | 100 € |
| **Subtotal Marketing** | | **1,900 €** |

---

### 1.4. Capital de Trabajo (Primeros 6 meses post-lanzamiento)

| Concepto | Descripción | Coste Estimado |
|----------|-------------|----------------|
| **Desarrollo continuo** | 20h/mes mantenimiento y nuevas features (3 meses × 20h × 20€/h, equipo fundador) | 1,200 € |
| **Soporte al cliente** | Tiempo de respuesta a usuarios (10h/mes × 3 meses × 20€/h, automatizado con chatbots) | 600 € |
| **Contingencias** | Imprevistos técnicos, bugs críticos (reserva lean para pivots rápidos) | 400 € |
| **Subtotal Capital de Trabajo** | | **2,200 €** |

---

### 1.5. Resumen de Necesidades Totales

| Categoría | Coste |
|-----------|-------|
| **1. Desarrollo MVP** (completado) | 4,541 € |
| **2. Infraestructura Año 1** (con escalado) | 1,911 € |
| **3. Marketing y Lanzamiento** | 1,900 € |
| **4. Capital de Trabajo** (6 meses) | 2,200 € |
| **TOTAL NECESIDADES DE FINANCIACIÓN** | **10,552 €** |

**Desglose temporal**:
- **Inversión inicial inmediata**: 4,611 € (infraestructura año 1 + marketing + contingencias)
- **Ya invertido (desarrollo MVP)**: 4,541 € (tiempo del equipo)
- **Capital de trabajo progresivo**: 2,200 € (repartido en 6 meses)

---

## 2. Análisis de Fuentes de Financiación

### 2.1. Autofinanciación

#### Descripción
Financiar el proyecto con ahorros personales del equipo fundador o reinversión de ingresos propios.

#### Ventajas
✅ **Control total**: No se cede equity ni se asumen deudas  
✅ **Flexibilidad**: Decisiones rápidas sin necesidad de aprobaciones externas  
✅ **Sin obligaciones**: No hay calendario de devolución ni pagos de intereses  
✅ **Aprendizaje**: Gestión austera y foco en rentabilidad desde día 1, alineado con principios lean de Eric Ries

#### Desventajas
❌ **Riesgo personal**: Pérdida de ahorros personales si el proyecto falla  
❌ **Capacidad limitada**: Difícil financiar más de 3,000-5,000 € entre 3 socios  
❌ **Crecimiento lento**: Sin capital externo, el crecimiento es más gradual  
❌ **Oportunidad de costo**: El dinero invertido no genera rendimientos en otras inversiones

#### Aplicabilidad a TuberIA
**Viable para**: Cubrir el desarrollo MVP (ya realizado) y parte de la infraestructura inicial, permitiendo bootstrapping rápido.  
**Insuficiente para**: Escalado masivo, pero combinado con viralidad, puede impulsar growth hacking.  
**Estimación**: El equipo podría autofinanciar entre **2,000-3,000 €** (dividiendo costes entre 3 socios).

---

### 2.2. Préstamos Bancarios

#### Descripción
Solicitar un préstamo bancario para startups o un microcrédito empresarial.

#### Ventajas
✅ **No se cede equity**: Los socios mantienen el 100% de la propiedad  
✅ **Montos accesibles**: Los bancos pueden prestar entre 5,000-50,000 € para proyectos validados  
✅ **Condiciones claras**: Calendario de pagos predefinido (cuotas mensuales)  
✅ **Intereses deducibles**: Los intereses del préstamo son deducibles fiscalmente

#### Desventajas
❌ **Requiere garantías**: Los bancos suelen pedir avales personales o garantías (vivienda, vehículo)  
❌ **Obligación de devolución**: Hay que pagar cuotas incluso si no hay ingresos  
❌ **Intereses elevados**: TIN del 6-12% anual para startups sin historial  
❌ **Proceso lento**: Puede tardar 2-3 meses en aprobarse  
❌ **Difícil acceso**: Los bancos son reacios a financiar startups tecnológicas sin facturación

#### Ejemplo de Condiciones (Préstamo ICO para Startups)
- **Monto**: 10,000 €  
- **TIN**: 8% anual  
- **Plazo**: 5 años (60 meses)  
- **Cuota mensual**: ~203 €/mes  
- **Total a devolver**: 12,180 € (2,180 € en intereses)

#### Aplicabilidad a TuberIA
**Viable si**: Uno de los socios tiene nómina o puede aportar aval personal.  
**Riesgo**: Comprometer patrimonio personal por un proyecto en fase temprana, contrario a la mentalidad de "fail fast" de Paul Graham.  
**Estimación**: Préstamo de **8,000-10,000 €** cubriría infraestructura + marketing completo.

---

### 2.3. Ayudas Públicas y Subvenciones

#### Descripción
Solicitar subvenciones públicas para startups tecnológicas ofrecidas por organismos nacionales, autonómicos o europeos.

#### Programas Relevantes para TuberIA

##### A. **Kit Digital** (España)
- **Organismo**: Red.es (Gobierno de España)  
- **Cuantía**: Hasta 12,000 € en bonos digitales  
- **Requisitos**: Ser empresa con < 50 empleados, estar dado de alta en RETA/Seguridad Social  
- **Concepto**: Subvención a fondo perdido para digitalización (desarrollo web/app, IA, cloud)  
- **Plazo**: Solicitud abierta todo el año  
- **Estado TuberIA**: ✅ Proyecto elegible (SaaS con IA)

##### B. **ENISA - Línea Jóvenes Emprendedores**
- **Organismo**: ENISA (Empresa Nacional de Innovación)  
- **Cuantía**: Préstamo participativo de 25,000 - 75,000 €  
- **Requisitos**: Emprendedores < 40 años, proyecto innovador, inversión privada mínima (25% del préstamo)  
- **Condiciones**: TIN 3,75% + interés variable según resultados, sin garantías personales  
- **Plazo amortización**: 5-7 años con 5 años de carencia  
- **Estado TuberIA**: ✅ Proyecto elegible (tecnología innovadora, equipo joven)

##### C. **Horizon Europe - EIC Accelerator**
- **Organismo**: Comisión Europea  
- **Cuantía**: Hasta 2,5 millones € (equity + subvención)  
- **Requisitos**: Proyecto de alto impacto, tecnología disruptiva  
- **Estado TuberIA**: ❌ Demasiado complejo para fase actual (requiere tracción demostrada), pero futuro objetivo para escalado.

#### Ventajas
✅ **Capital no reembolsable**: Algunas ayudas son a fondo perdido (Kit Digital)  
✅ **Condiciones ventajosas**: Los préstamos participativos (ENISA) tienen TIN bajo y sin garantías  
✅ **Validación institucional**: Recibir una subvención pública da credibilidad al proyecto  
✅ **Sin dilución de equity**: No se cede propiedad de la empresa, ideal para mantener control como aconseja Peter Thiel en "Zero to One"

#### Desventajas
❌ **Proceso lento**: Pueden pasar 6-12 meses desde la solicitud hasta el cobro  
❌ **Burocracia compleja**: Requiere documentación exhaustiva y justificación de gastos  
❌ **Requisitos estrictos**: Hay que estar constituido como empresa (autónomos o SL)  
❌ **Incertidumbre**: No hay garantía de aprobación (tasa de éxito 20-40%)

#### Aplicabilidad a TuberIA
**Estrategia recomendada**:  
1. Solicitar **Kit Digital** inmediatamente tras constituirse como empresa (12,000 €)  
2. Solicitar **ENISA Jóvenes Emprendedores** con tracción inicial (25,000-50,000 €)  

**Estimación**: **12,000 € (Kit Digital)** + **25,000 € (ENISA)** = **37,000 €** en financiación pública.

---

### 2.4. Business Angels

#### Descripción
Inversores privados (personas físicas) que invierten capital en startups en fase temprana a cambio de equity.

#### Características
- **Monto típico**: 10,000 - 100,000 € por angel  
- **Equity cedido**: 5-20% de la empresa  
- **Valoración pre-money típica**: 50,000 - 300,000 € para startups pre-revenue  
- **Además del dinero**: Aportan mentoría, contactos y experiencia sectorial

#### Ventajas
✅ **Acceso rápido a capital**: Proceso de inversión más ágil que VC (1-3 meses)  
✅ **Mentoría valiosa**: Los angels suelen ser emprendedores experimentados, ofreciendo insights como los de Elon Musk en first principles thinking  
✅ **Flexibilidad**: Más abiertos a proyectos en fase temprana sin tracción  
✅ **Red de contactos**: Facilitan introducción a clientes, partners y futuros inversores, acelerando growth

#### Desventajas
❌ **Dilución de equity**: Se cede entre 10-20% de la empresa  
❌ **Búsqueda compleja**: Encontrar al angel adecuado requiere networking intenso  
❌ **Expectativas de crecimiento**: Esperan un retorno de 5-10x en 5-7 años  
❌ **Posible conflicto**: Si hay múltiples angels, pueden surgir desacuerdos estratégicos

#### Ejemplo de Estructura (TuberIA)
- **Inversión**: 30,000 €  
- **Valoración pre-money**: 150,000 €  
- **Equity cedido**: 16,7% (30k / 180k post-money)  
- **Uso del capital**: 50% marketing, 30% desarrollo, 20% infraestructura

#### Aplicabilidad a TuberIA
**Perfil de angel ideal**:  
- Experiencia en SaaS B2C o herramientas de productividad  
- Conocimiento del sector EdTech o Content Creation  
- Red de contactos en YouTube, podcasting o IA  

**Requisitos previos**:  
- Tener MVP funcional (✅ ya completado)  
- Mostrar tracción inicial: 100-500 usuarios registrados  
- Validación del modelo de negocio: primeras conversiones freemium → premium  

**Estimación**: Inversión de **25,000-40,000 €** cediendo **15-20% equity**.

---

### 2.5. Venture Capital (VC)

#### Descripción
Fondos de inversión especializados en startups de alto crecimiento que invierten grandes sumas a cambio de equity significativo.

#### Características
- **Monto típico**: 500,000 - 5,000,000 € (ronda Seed)  
- **Equity cedido**: 20-40% de la empresa  
- **Valoración pre-money típica**: 1-5 millones € (para Seed)  
- **Proceso**: Muy selectivo (invierten en <1% de proyectos que evalúan)

#### Ventajas
✅ **Capital significativo**: Permite escalar rápidamente (contratar equipo, marketing agresivo)  
✅ **Red de contactos top**: Acceso a partners estratégicos, clientes enterprise, futuros inversores  
✅ **Credibilidad**: Tener un VC reconocido aumenta la visibilidad del proyecto  
✅ **Experiencia de escalado**: Los VCs han visto muchas startups y aportan best practices, como las de Sam Altman en compounding success

#### Desventajas
❌ **Dilución muy alta**: Se suele ceder 25-40% en rondas tempranas  
❌ **Presión por resultados**: Expectativas de crecimiento exponencial (10x en 5 años)  
❌ **Pérdida de control**: Los VCs exigen asientos en el board y voto en decisiones clave  
❌ **Inaccesible en fase temprana**: Requieren tracción demostrada (MRR > 5k-10k €/mes)  
❌ **Proceso lento**: Due diligence exhaustiva (3-6 meses)

#### Aplicabilidad a TuberIA
**Estado actual**: ❌ **No aplicable aún**, pero con viralidad, alcanzable pronto.  
**Requisitos previos para acceder a VC**:  
- MRR (Monthly Recurring Revenue) > 10,000 €/mes  
- Crecimiento mensual > 20% (3 meses consecutivos)  
- Base de usuarios > 5,000 usuarios activos mensuales  
- Product-Market Fit demostrado  
- Equipo completo (CTO, CPO, CEO claramente definidos)  

**Estimación futura**: En 18-24 meses, con tracción demostrada, TuberIA podría acceder a **500,000-1M €** en ronda Seed cediendo **25-30% equity**.

---

### 2.6. Crowdfunding

#### Descripción
Financiación colectiva a través de plataformas online donde muchas personas aportan pequeñas cantidades de dinero.

#### Modalidades

##### A. **Reward-based** (Kickstarter, Indiegogo)
- **Mecánica**: Los backers reciben recompensas (acceso anticipado, suscripción gratuita, merchandising)  
- **Monto típico**: 5,000 - 50,000 €  
- **No se cede equity**: Los backers solo reciben el producto/servicio

##### B. **Equity crowdfunding** (Seedrs, Crowdcube, The Crowd Angel España)
- **Mecánica**: Los inversores reciben equity de la empresa  
- **Monto típico**: 50,000 - 500,000 €  
- **Equity cedido**: 10-25%

#### Ventajas
✅ **Validación de mercado**: Si se alcanza el objetivo, confirma que hay demanda, alineado con validated learning de Lean Startup  
✅ **Marketing gratuito**: La campaña genera visibilidad y viralidad  
✅ **Comunidad de early adopters**: Los backers se convierten en evangelizadores del producto  
✅ **Sin deuda ni dilución** (en reward-based): Solo se entrega el producto, perfecto para bootstrapping

#### Desventajas
❌ **Requiere campaña intensa**: Hay que invertir tiempo y dinero en vídeo, copy, promoción  
❌ **All-or-nothing**: Si no se alcanza el objetivo, no se recibe nada (en algunas plataformas)  
❌ **Comisiones altas**: Las plataformas cobran 5-8% del capital recaudado  
❌ **Obligación de entregar**: Hay que cumplir con las recompensas prometidas

#### Aplicabilidad a TuberIA
**Estrategia recomendada**: **Reward-based en Kickstarter** para leverage comunidad de YouTubers.  
**Objetivo**: 15,000 €  
**Recompensas**:  
- 10 € → 1 mes de TuberIA Premium  
- 50 € → 1 año de TuberIA Premium (early bird)  
- 150 € → Lifetime access + nombre en "Founders Wall"  

**Requisitos previos**:  
- Vídeo demo profesional del producto  
- Landing page optimizada con copy persuasivo  
- Estrategia de promoción pre-lanzamiento (lista de emails, redes sociales)  

**Estimación**: **10,000-20,000 €** si la campaña tiene éxito, impulsando growth orgánico.

---

### 2.7. Aceleradoras e Incubadoras

#### Descripción
Programas de 3-6 meses que ofrecen financiación inicial, mentoría, formación y acceso a red de inversores a cambio de equity.

#### Ejemplos Relevantes para TuberIA

##### A. **Lanzadera** (Valencia)
- **Financiación**: Hasta 50,000 € en inversión + servicios valorados en 100,000 €  
- **Equity**: 3-7% de la startup  
- **Duración**: 6-12 meses  
- **Requisitos**: Proyecto innovador, equipo comprometido full-time  
- **Estado TuberIA**: ✅ Proyecto elegible (SaaS B2C con IA)

##### B. **Wayra (Telefónica)** (Madrid)
- **Financiación**: 50,000 - 100,000 €  
- **Equity**: 6-10%  
- **Duración**: 6 meses  
- **Beneficios adicionales**: Acceso a infraestructura Telefónica, potenciales clientes enterprise  
- **Estado TuberIA**: ✅ Proyecto elegible (producto digital escalable)

##### C. **Y Combinator** (Silicon Valley)
- **Financiación**: 500,000 USD (~125k + 375k SAFE note)  
- **Equity**: 7% (estándar)  
- **Duración**: 3 meses  
- **Estado TuberIA**: ⚠️ Muy competitivo (tasa de aceptación <2%), requiere mudanza a EE.UU., pero aspiracional para global scaling.

#### Ventajas
✅ **Financiación + servicios**: Además de capital, se recibe mentoría, oficinas, herramientas  
✅ **Red de inversores**: Demo Day con acceso a VCs y business angels  
✅ **Credibilidad**: Salir de una aceleradora reconocida es un sello de calidad  
✅ **Equity razonable**: Se cede menos equity que con VCs (3-10% vs 25-40%), permitiendo focus en product como aconseja Paul Graham

#### Desventajas
❌ **Proceso selectivo**: Tasa de aceptación del 1-5%  
❌ **Compromiso full-time**: Requiere dedicación exclusiva durante 3-6 meses  
❌ **Ubicación**: Algunas aceleradoras requieren mudarse a otra ciudad  
❌ **Presión por resultados**: Hay que mostrar tracción rápida para atraer inversores en el Demo Day

#### Aplicabilidad a TuberIA
**Estrategia recomendada**: Aplicar a **Lanzadera** o **Wayra** tras validar el modelo de negocio.  
**Requisitos previos**:  
- MVP funcional (✅ ya completado)  
- Primeros 100-500 usuarios registrados  
- Modelo de monetización definido (freemium → premium)  
- Equipo comprometido full-time (al menos 2/3 fundadores)  

**Estimación**: **50,000 €** cediendo **5-7% equity**.

---

### 2.8. Comparativa de Fuentes de Financiación

| Fuente | Monto Estimado | Equity Cedido | Ventaja Principal | Desventaja Principal | Aplicabilidad TuberIA |
|--------|----------------|---------------|-------------------|----------------------|-----------------------|
| **Autofinanciación** | 2,000-3,000 € | 0% | Control total y lean growth | Capacidad limitada | ✅ Viable (fase inicial, bootstrapping) |
| **Préstamo bancario** | 8,000-10,000 € | 0% | No cede equity | Requiere garantías | ⚠️ Riesgoso (avales personales) |
| **Kit Digital** | 12,000 € | 0% | Fondo perdido, validación | Burocracia | ✅ Altamente recomendado |
| **ENISA** | 25,000 € | 0% | Sin garantías, TIN bajo | Proceso lento | ✅ Recomendado (tras constituirse) |
| **Business Angels** | 30,000 € | 15-20% | Mentoría + red estratégica | Dilución | ✅ Viable (con tracción inicial) |
| **Crowdfunding** | 15,000 € | 0-10% | Validación mercado y viralidad | Requiere campaña | ✅ Opción interesante para community building |
| **Aceleradoras** | 50,000 € | 5-7% | Financiación + mentoría acelerada | Compromiso full-time | ✅ Recomendado (medio plazo, scaling) |
| **Venture Capital** | 500,000 € | 25-30% | Capital significativo para hypergrowth | Muy selectivo, alta dilución | ❌ No aplicable aún, pero futuro para monopoly building |

---

## 3. Plan de Financiación Propuesto

### 3.1. Estrategia Recomendada: Financiación Mixta en 3 Fases

#### **FASE 1: Bootstrapping + Ayudas Públicas** (Meses 0-6)
**Objetivo**: Validar el modelo de negocio con tracción inicial sin ceder equity, enfocados en MVP y growth hacking.

**Fuentes de financiación**:
1. **Autofinanciación**: 2,500 € (ahorros del equipo, dividido entre 3 socios)  
2. **Kit Digital**: 12,000 € (solicitar inmediatamente tras constituirse como empresa)  
3. **Crowdfunding (Kickstarter)**: 12,000 € (campaña reward-based de 30 días, leverage viralidad)

**Total Fase 1**: **26,500 €**  
**Equity cedido**: **0%**

**Uso del capital**:
| Concepto | Monto |
|----------|-------|
| Infraestructura año 1 (con escalado) | 1,911 € |
| Marketing y lanzamiento (ads + affiliates) | 1,900 € |
| Desarrollo continuo (3 meses) | 1,200 € |
| Contingencias | 400 € |
| **Reserva de tesorería** | **21,089 €** |

**KPIs objetivo Fase 1**:
- 1,000 usuarios registrados  
- 100 usuarios Premium (conversión freemium → premium del 10%)  
- MRR: 500 €/mes (100 usuarios × 5 €/mes)

---

#### **FASE 2: Aceleradora + Business Angel** (Meses 6-12)
**Objetivo**: Escalar producto y equipo para alcanzar Product-Market Fit, con affiliates impulsando referrals.

**Fuentes de financiación**:
1. **Lanzadera o Wayra**: 50,000 € (cediendo 5-7% equity)  
2. **Business Angel**: 30,000 € (cediendo 12-15% equity)  
3. **ENISA Jóvenes Emprendedores**: 25,000 € (préstamo participativo, 0% equity)

**Total Fase 2**: **105,000 €**  
**Equity cedido total acumulado**: **17-22%**

**Uso del capital**:
| Concepto | Monto |
|----------|-------|
| Contratar 1 developer full-time (6 meses) | 30,000 € |
| Contratar 1 growth marketer part-time (6 meses) | 15,000 € |
| Marketing digital agresivo (SEM, SEO, affiliates) | 25,000 € |
| Infraestructura escalada (6 meses) | 10,000 € |
| Desarrollo de features premium adicionales | 15,000 € |
| **Reserva de tesorería** | **10,000 €** |

**KPIs objetivo Fase 2**:
- 10,000 usuarios registrados  
- 800 usuarios Premium (conversión del 8%)  
- MRR: 4,000 €/mes (800 usuarios × 5 €/mes)  
- CAC (Customer Acquisition Cost): < 10 €  
- LTV (Lifetime Value): > 60 €

---

#### **FASE 3: Venture Capital (Seed Round)** (Meses 12-24)
**Objetivo**: Escalar internacionalmente y consolidar liderazgo en el nicho, building a monopoly como Peter Thiel.

**Fuentes de financiación**:
1. **Ronda Seed (VC)**: 800,000 € (cediendo 25-30% equity)

**Total Fase 3**: **800,000 €**  
**Equity cedido total acumulado**: **42-52%**

**Uso del capital**:
| Concepto | Monto |
|----------|-------|
| Equipo (10 personas durante 12 meses) | 450,000 € |
| Marketing internacional (EE.UU., UK) | 200,000 € |
| Infraestructura enterprise (escalado > 100k usuarios) | 50,000 € |
| Partnerships estratégicos (YouTube, podcasters) | 50,000 € |
| **Reserva de tesorería** | **50,000 €** |

**KPIs objetivo Fase 3**:
- 100,000 usuarios registrados  
- 5,000 usuarios Premium (conversión del 5%)  
- MRR: 25,000 €/mes  
- Ingresos anuales: 300,000 €  
- Break-even operativo alcanzado

---

### 3.2. Tabla Resumen del Plan de Financiación

| Fase | Periodo | Fuentes | Monto Total | Equity Cedido | Equity Acumulado |
|------|---------|---------|-------------|---------------|------------------|
| **Fase 1** | Meses 0-6 | Autofinanciación + Kit Digital + Crowdfunding | 26,500 € | 0% | 0% |
| **Fase 2** | Meses 6-12 | Aceleradora + Business Angel + ENISA | 105,000 € | 17-22% | 17-22% |
| **Fase 3** | Meses 12-24 | Venture Capital (Seed) | 800,000 € | 25-30% | 42-52% |
| **TOTAL** | 24 meses | | **931,500 €** | | **42-52%** |

---

### 3.3. Desglose de Equity Final (24 meses)

Asumiendo el escenario medio de la Fase 3:

| Stakeholder | Equity (%) |
|-------------|------------|
| **Equipo fundador** (3 socios) | 48-58% |
| Aceleradora (Lanzadera/Wayra) | 5-7% |
| Business Angel | 12-15% |
| Venture Capital (Seed) | 25-30% |
| **Pool de opciones para empleados** | 10% (a reservar antes de Seed) |

---

## 4. Justificación y Estrategia

### 4.1. ¿Por qué esta estrategia?

#### A. **Minimiza riesgo personal en etapa inicial**
- La autofinanciación se limita a 2,500 € (833 € por socio), sin comprometer ahorros personales significativos, permitiendo "fail fast" como en Lean Startup de Eric Ries.  
- No se solicitan préstamos bancarios con avales personales en fase temprana.

#### B. **Maximiza financiación no dilutiva**
- Se aprovechan al máximo las ayudas públicas (Kit Digital: 12,000 € + ENISA: 25,000 €) que no ceden equity.  
- El crowdfunding (reward-based) no solo financia sino valida mercado y genera buzz viral, como Elon Musk con word-of-mouth en Tesla.

#### C. **Mantiene control en fase temprana**
- Durante los primeros 6-12 meses, el equipo fundador mantiene el 80-85% del equity.  
- Se cede equity solo cuando hay tracción demostrada, lo que aumenta la valoración, siguiendo "secrets" de Peter Thiel en Zero to One.

#### D. **Acceso progresivo a capital**
- No se busca capital VC prematuramente (error común de startups).  
- Se escala la financiación conforme se alcanzan hitos: MVP → tracción → Product-Market Fit → escalado, compounding success como Sam Altman.

#### E. **Red de valor añadido**
- La aceleradora y el business angel aportan mentoría y contactos además de capital.  
- El VC en Fase 3 solo entra cuando TuberIA ha probado su viabilidad, enfocados en monopoly building.

---

### 4.2. Plan B: Si no se consigue financiación externa

**Escenario conservador**: Solo autofinanciación + Kit Digital = **14,500 €**

**Estrategia alternativa**:
1. **Foco en orgánico**: Crecer mediante SEO, content marketing, boca a oreja y affiliates (YouTubers promoviendo por comisiones).  
2. **Freelancing paralelo**: Los fundadores mantienen trabajos part-time para financiar el desarrollo.  
3. **Lean startup extremo**: Priorizar features que generan ingresos inmediatos (monetización desde día 1, split testing ads).  
4. **Bootstrapping hasta break-even**: Crecer lentamente reinvirtiendo todos los ingresos, leverage viralidad.

**Ventaja**: Control total (100% equity), potencial para hypergrowth orgánico.  
**Desventaja**: Crecimiento más lento, pero viable (2-3 años hasta 10k usuarios con affiliates).

---

### 4.3. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Kit Digital se rechaza | Media | Alto | Solicitar asesoría especializada (gestorías) para cumplir requisitos |
| Campaña crowdfunding falla | Alta | Medio | Tener Plan B con autofinanciación ampliada (5,000 € entre socios), focus en affiliates |
| No se encuentra business angel | Media | Alto | Aplicar a aceleradora primero (Lanzadera/Wayra) que conecta con inversores |
| VC rechaza ronda Seed | Media | Medio | Extender Fase 2 con revenue-based financing o préstamo bancario para empresas con ingresos |
| Costes de infraestructura superan presupuesto | Baja | Medio | Mantener reserva de tesorería del 20% en cada fase, optimizar con uso-based scaling |

---

## Conclusión

TuberIA tiene una **necesidad de financiación total de 10,552 €** para lanzar y operar durante el primer año, desglosada en:  
- Desarrollo MVP (completado): 4,541 €  
- Infraestructura año 1: 1,911 €  
- Marketing: 1,900 €  
- Capital de trabajo: 2,200 €  

La **estrategia de financiación mixta en 3 fases** propuesta permite:  
✅ Minimizar riesgo personal (solo 2,500 € de autofinanciación)  
✅ Maximizar financiación no dilutiva (37,000 € en ayudas públicas)  
✅ Mantener control en etapa temprana (80% equity tras 12 meses)  
✅ Acceder a capital creciente conforme se valida el modelo de negocio, con innovación como affiliates para viral growth  

**Próximos pasos inmediatos**:  
1. ✅ Constituir la empresa (SL o autónomos societarios)  
2. 🎯 Solicitar Kit Digital (12,000 € - plazo 2-3 meses)  
3. 🎯 Lanzar campaña de crowdfunding en Kickstarter (objetivo 12,000 €)  
4. 🎯 Comenzar networking con business angels del ecosistema SaaS español  

---

**Última actualización**: Diciembre 2025  
**Documento elaborado por**: Equipo TuberIA  
**Referencias**: [`presupuesto.md`](./presupuesto.md), [`estructura-organizativa.md`](./estructura-organizativa.md)