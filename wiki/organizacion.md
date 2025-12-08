# TuberIA App Wiki - Organización

## Navegación:
- [**HOME - Wiki**](./INDEX.md)

---

## 3a) Secuenciación y priorización de actividades



---

## 3b) Asignación de recursos y logística

### 1. Identificación de perfiles necesarios:
- Frontend: Natalia y Alfonso
- Backend: Ezequiel
- DevOps: Ezequiel y Alfonso
- QA/Testing: Ezequiel y Natalia

Ezequiel: @obezeq
Natalia: @Naleper90
Alfonso: @acasmor0802

## 2. Asignación de tareas en GitHub Projects:
- Planificamos el proyecto con GitHub Projects y cada issue se le asigna principalmente a una persona, para realizar acabo una tarea, feature o bug fix.
- En el sprint planning definimos quien va a hacer cada issue y tenemos en cuenta que este equilibrado con el resto del equipo en la mayoría de lo posible, intentando evitar así, cuellos de botella.

## 3. Estimación de esfuerzo:
- Hemos elegido la técnica de planificación de Planning Poker, la estimación de horas se encuentras si o si en un número fibonacci en el campo "Estimación (horas)" de GitHub Projects. Una vez la tarea ha sido completada, el equipo verifica si efectivamente se ha cumplido en el plazo propuesto, o si por el contrario se ha tardado mas o menos.
- Esta forma de planificar no sería posible sin Toggle Tracker, utilizamos toggle tracker para medir cualquier cosa que hagamos, de esta forma nos podemos permitir tener objetivos específicos y medibles. Para poder realizar un progreso de mejora continua en el proyecto, y poder aprender que ocurre cada semana en el sprint review que realizamos, donde documentamos errores y sus soluciones.
- Si estás interesado en observar el sprint review y planificación de cada objetivo puedes verlo [**AQUÍ**](objetivos/objetivos.md)

## 4. Balanceo de carga
- Siempre se intenta hacer un balanceo de carga en cuanto al trabajo que tiene cada miembro. Además si algún compañero nota un cuello de botella o que para realizar su funcionalidad falta que otro compañero realice cierta funcionalidad, se informa inmediatamente, con su creación de issue de tipo inmediata para que el otro compañero pueda arreglar dicha funcionalidad. De mientras, como hay mas issues asignados, el otro compañero que esta esperando, puede continuar trabajando en otra rama para otro issue.
- Esta organización de balanceo de carga, nos permite, no solo balancear la carga de trabajo entre todo el equipo, sino también ser mas eficientes a la hora de realizar el trabajo.

## 5. Recursos materiales y herramientas:
- Editores de código: Usamos principalmente VS Code, y también nos manejamos mucho con la terminal / shell para ejecutar contenedores de docker, o acceder a logs de cualquier tipo.
- Herramientas de diseño: Se ha utilizado Figma para realizar el [**wireframe**](../design/wireframes/) y el [**mockup**](../design/mockups/)
- Software de pruebas: se ha utilizado Postman para realizar peticiones de API, a la vez que cualquier tipo de test en el backend para testear la funcionalidad de cada endpoint, servicio, o lógica de negocio de la infraestructura del backend.
- Servicios externos: hemos contado con un Droplet (VPS) de DigitalOcean como hemos comentado en ciertas ocasiones en la documentación principal. Y no hemos usado ningún otro tipo de servicio, debido a que somos totalmente independientes con Docker y la dockerización de la base de datos (MongoDB y Redis) que nos permite mantener un entorno seguro, escalable sin depender de cualquier tercero.

---

[**VOLVER AL HOME DE LA WIKI**](./INDEX.md)

