# Presupuesto Económico - TuberIA

**Documento**: Criterio 2f - Presupuesto económico basado en tiempo invertido  
**Período**: 6 sprints (31 Octubre 2025 - 11 Diciembre 2025)  
**Equipo**: 3 desarrolladores Junior (20 €/hora)

---

## 1. Metodología

### 1.1. Estimación
- **Proceso**: Durante Sprint Planning, estimación de horas por cada issue. Reformulación si hubiera discrepancia.
- **Campo GitHub Projects**: "Estimación (horas)" por issue

### 1.2. Medición de tiempo real
- **Herramienta**: Toggl Track (plan gratuito)
- **Flujo**:
  1. Abrir issue en GitHub → mover a "In Progress"
  2. Iniciar timer en Toggl Track
  3. Trabajar en la tarea (pausar si interrupciones)
  4. Añadir comentario de progreso en GitHub
  5. Detener timer al finalizar
  6. Exportar horas desde Toggl Track → actualizar "Horas Reales" en GitHub Projects
- **Campo GitHub Projects**: "Horas Reales" (del reporte Toggl Track)

### 1.3. Tarifa horaria
- **Junior Developer**: 20 €/hora (equipo académico, 0-2 años experiencia)

---

## 2. Estimaciones y Costes por Sprint

### Sprint 1: Infraestructura y Fundamentos (31 Oct - 06 Nov 2025)
- **Horas estimadas**: 28 h
- **Coste estimado**: 560 €
- **Horas reales**: 36 h
- **Coste real**: 720 €

### Sprint 2: Autenticación y Frontend Inicial (07 Nov - 13 Nov 2025)
- **Horas estimadas**: 16 h
- **Coste estimado**: 320 €
- **Horas reales**: 24 h
- **Coste real**: 480 €

### Sprint 3: Autenticación Frontend y Backend Search (14 Nov - 20 Nov 2025)
- **Horas estimadas**: 11 h
- **Coste estimado**: 220 €
- **Horas reales**: 22 h
- **Coste real**: 440 €

### Sprint 4: Dashboard y Páginas Core (21 Nov - 27 Nov 2025)
- **Horas estimadas**: 8 h
- **Coste estimado**: 160 €
- **Horas reales**: 18 h
- **Coste real**: 360 €

### Sprint 5: Workers y Frontend Avanzado (28 Nov - 04 Dic 2025)
- **Horas estimadas**: 55 h
- **Coste estimado**: 1,100 €
- **Horas reales**: 68 h
- **Coste real**: 1,360 €

### Sprint 6: Fixes Finales (05 Dic - 11 Dic 2025)
- **Horas estimadas**: 19 h
- **Coste estimado**: 380 €
- **Horas reales**: 59.05 h
- **Coste real**: 1,181 €

---

## 3. Comparación Estimación vs. Realidad

| Sprint | Horas Estimadas | Horas Reales | Desviación (h) | Desviación % | Coste Estimado | Coste Real | Desviación (€) |
|--------|-----------------|--------------|----------------|--------------|----------------|------------|----------------|
| Sprint 1 | 28 | 36 | +8 | +28.6% | 560 € | 720 € | +160 € |
| Sprint 2 | 16 | 24 | +8 | +50% | 320 € | 480 € | +160 € |
| Sprint 3 | 11 | 22 | +11 | +100% | 220 € | 440 € | +220 € |
| Sprint 4 | 8 | 18 | +10 | +125% | 160 € | 360 € | +200 € |
| Sprint 5 | 55 | 68 | +13 | +23.6% | 1,100 € | 1,360 € | +260 € |
| Sprint 6 | 19 | 59.05 | +40.05 | +210.8% | 380 € | 1,181 € | +801 € |
| **TOTAL** | **137** | **227.05** | **+90.05** | **+65.7%** | **2,740 €** | **4,541 €** | **+1,801 €** |

---

## 4. Presupuesto Total del Proyecto

### 4.1. Costes de desarrollo
- **Total horas estimadas**: 137 h
- **Total horas reales**: 227.05 h
- **Coste total estimado**: 2,740 €
- **Coste total real**: 4,541 € (227.05 h × 20 €/h)
- **Desglose**: ~75.7 horas por persona (3 personas) = ~12.6 horas/semana por persona

### 4.2. Costes adicionales (infraestructura y servicios)
| Concepto | Coste Estimado | Coste Real | Observaciones |
|----------|----------------|------------|---------------|
| DigitalOcean VPS (6 meses) | 60 € | 0 € | Cubierto por crédito educativo |
| Dominio (1 año) | 1 € | 0 € | Cubierto por crédito educativo |
| OpenRouter API (6 meses) | 30 € | 30 € | Uso de API en producción |
| GitHub (6 meses) | 0 € | 0 € | Plan educativo gratuito |
| Toggl Track (6 meses) | 0 € | 0 € | Plan gratuito |
| **TOTAL INFRAESTRUCTURA** | **91 €** | **30 €** | Coste real desembolsado |

### 4.3. Presupuesto final consolidado
| Concepto | Coste Real (€) | Notas |
|----------|----------------|-------|
| Desarrollo (Humanos) | 4,541 € | Valoración del tiempo invertido |
| Infraestructura (Materiales) | 30 € | Dinero real desembolsado |
| **VALOR TOTAL PROYECTO** | **4,571 €** | |

---

## 5. Análisis de Desviaciones

### 5.1. Resumen general
El proyecto ha tenido una desviación global significativa (**+65.7%** en tiempo y coste), lo que indica una subestimación general en la planificación. Se observan tendencias de subestimación en todas las fases del proyecto:

1. **Fase inicial (Sprints 1-2)**: Subestimación moderada (+28% a +50%). Las tareas de configuración y diseño inicial resultaron más complejas de lo previsto, posiblemente debido a ajustes adicionales no anticipados.
2. **Fase media (Sprints 3-4)**: Subestimación alta (+100% a +125%). El equipo encontró más desafíos en la integración y desarrollo core de lo estimado.
3. **Fase final (Sprints 5-6)**: Subestimación notable (+23% a +210%). La complejidad de la integración de workers, corrección de bugs finales y testing fue considerablemente mayor de la esperada.

### 5.2. Principales causas de desviación (Sprint 6)
El Sprint 6 tuvo la mayor desviación (+210%), debida principalmente a:
- Corrección de bugs críticos no previstos antes de la demo, incluyendo issues adicionales identificados en revisiones finales.
- Ajustes finales en la integración de la API de IA que requirieron más pruebas y refactorizaciones de lo estimado.
- Trabajo extra en optimizaciones y fixes distribuidos desde sprints anteriores, pero concentrados en esta fase final.
