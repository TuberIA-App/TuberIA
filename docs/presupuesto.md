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
- **Horas reales**: 26 h
- **Coste real**: 520 €

### Sprint 2: Autenticación y Frontend Inicial (07 Nov - 13 Nov 2025)
- **Horas estimadas**: 16 h
- **Coste estimado**: 320 €
- **Horas reales**: 14 h
- **Coste real**: 280 €

### Sprint 3: Autenticación Frontend y Backend Search (14 Nov - 20 Nov 2025)
- **Horas estimadas**: 11 h
- **Coste estimado**: 220 €
- **Horas reales**: 12 h
- **Coste real**: 240 €

### Sprint 4: Dashboard y Páginas Core (21 Nov - 27 Nov 2025)
- **Horas estimadas**: 8 h
- **Coste estimado**: 160 €
- **Horas reales**: 8 h
- **Coste real**: 160 €

### Sprint 5: Workers y Frontend Avanzado (28 Nov - 04 Dic 2025)
- **Horas estimadas**: 55 h
- **Coste estimado**: 1,100 €
- **Horas reales**: 58 h
- **Coste real**: 1,160 €

### Sprint 6: Fixes Finales (05 Dic - 11 Dic 2025)
- **Horas estimadas**: 19 h
- **Coste estimado**: 380 €
- **Horas reales**: 23 h
- **Coste real**: 460 €

---

## 3. Comparación Estimación vs. Realidad

| Sprint | Horas Estimadas | Horas Reales | Desviación (h) | Desviación % | Coste Estimado | Coste Real | Desviación (€) |
|--------|-----------------|--------------|----------------|--------------|----------------|------------|----------------|
| Sprint 1 | 28 | 26 | -2 | -7.1% | 560 € | 520 € | -40 € |
| Sprint 2 | 16 | 14 | -2 | -12.5% | 320 € | 280 € | -40 € |
| Sprint 3 | 11 | 12 | +1 | +9.1% | 220 € | 240 € | +20 € |
| Sprint 4 | 8 | 8 | 0 | 0% | 160 € | 160 € | 0 € |
| Sprint 5 | 55 | 58 | +3 | +5.5% | 1,100 € | 1,160 € | +60 € |
| Sprint 6 | 19 | 23 | +4 | +21.1% | 380 € | 460 € | +80 € |
| **TOTAL** | **137** | **141** | **+4** | **+2.9%** | **2,740 €** | **2,820 €** | **+80 €** |

---

## 4. Presupuesto Total del Proyecto

### 4.1. Costes de desarrollo
- **Total horas estimadas**: 137 h
- **Total horas reales**: 141 h
- **Coste total estimado**: 2,740 €
- **Coste total real**: 2,820 € (141 h × 20 €/h)
- **Desglose**: ~47 horas por persona (3 personas) = ~7.8 horas/semana por persona

### 4.2. Costes adicionales (infraestructura y servicios)
| Concepto | Coste Estimado | Coste Real | Observaciones |
|----------|----------------|------------|---------------|
| DigitalOcean VPS (6 meses) | 60 € | 0 € | Cubierto por crédito educativo |
| Dominio (1 año) | 1 € | 0 € | Cubierto por crédito educativo |
| OpenRouter API (6 meses) | 30 € | 30 € | Uso de API en producción |
| GitHub (6 meses) | 0 € | 0 € | Plan educativo gratuito |
| Toggl Track (6 meses) | 0 € | 0 € | Plan gratuito |
| **TOTAL INFRAESTRUCTURA** | **3                                                                     0 €** | **39 €** | Coste real desembolsado |

### 4.3. Presupuesto final consolidado
| Concepto | Coste Real (€) | Notas |
|----------|----------------|-------|
| Desarrollo (Humanos) | 2,820 € | Valoración del tiempo invertido |
| Infraestructura (Materiales) | 30 € | Dinero real desembolsado |
| **VALOR TOTAL PROYECTO** | **2,850 €** | |

---

## 5. Análisis de Desviaciones

### 5.1. Resumen general
El proyecto ha tenido una desviación global muy baja (**+2.9%** en tiempo y coste), lo que indica una buena precisión en la planificación general. Sin embargo, se observan tendencias distintas según la fase del proyecto:

1. **Fase inicial (Sprints 1-2)**: Tendencia a la sobreestimación (-7% a -12%). Las tareas de configuración y diseño inicial resultaron más sencillas de lo previsto.
2. **Fase media (Sprints 3-4)**: Alta precisión. El equipo estabilizó su velocidad.
3. **Fase final (Sprints 5-6)**: Tendencia a la subestimación (+5% a +21%). La complejidad de la integración de workers, corrección de bugs finales y testing fue mayor de la esperada.

### 5.2. Principales causas de desviación (Sprint 6)
El Sprint 6 tuvo la mayor desviación (+21%), debida principalmente a:
- Corrección de bugs críticos no previstos antes de la demo.
- Ajustes finales en la integración de la API de IA que requirieron más pruebas de lo estimado.

---

