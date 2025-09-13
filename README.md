# 🪑 SitPlanner - Planificador de Mesas para Eventos

SitPlanner es una aplicación web ligera y completamente del lado del cliente que facilita la organización de invitados y mesas para cualquier tipo de evento. Importa listas desde CSV, distribuye invitados mediante drag & drop y exporta el esquema final para compartirlo o imprimirlo.

## Índice
- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Autor](#autor)

## Características
- Importación de invitados desde archivos CSV con campos: `name`, `group`, `notes`, `email`, `phone`, `company`.
- Creación y personalización de mesas: renombrar, definir capacidad y eliminar.
- Asignación de invitados mediante drag & drop intuitivo.
- Buscador por nombre, grupo o mesa asignada.
- Filtros rápidos por grupo.
- Guardado y carga de estados en JSON.
- Exportación del plan final a CSV.
- Vista de impresión optimizada.
- Autosave en `localStorage`.
- Diseño responsivo para escritorio, tablet y móvil.

## Requisitos
Solo se necesita un navegador moderno (Chrome, Firefox, Edge, Safari). El proyecto funciona de forma local sin servidores ni dependencias externas.

## Instalación
1. Clona o descarga este repositorio.
2. Abre `index.html` en tu navegador.
   También puedes servir la carpeta con cualquier servidor web estático.
3. (Opcional) Utiliza el archivo de ejemplo `Examples/invitados_demo.csv` para probar la importación.

## Uso
1. **Importar invitados**
   - Haz clic en **"Elegir archivo CSV"** y selecciona tu listado.
   - El campo `name` es obligatorio; los demás son opcionales.
2. **Agregar invitados manualmente**
   - Completa el nombre y, si quieres, el grupo.
   - Pulsa **"Agregar"** para incorporarlo a la lista.
3. **Crear mesas**
   - Indica la cantidad de mesas y una capacidad por defecto.
   - Presiona **"Crear mesas"**.
4. **Organizar invitados**
   - Arrastra cada invitado a la mesa deseada.
   - Usa el manejador `⋮⋮` para mover invitados o reordenar mesas.
   - Doble clic sobre el nombre de la mesa para renombrarla.
   - Doble clic sobre el contador para editar la capacidad.
5. **Guardar y exportar**
   - Guarda el estado en JSON para retomarlo después.
   - Exporta un CSV con todas las asignaciones.
   - Utiliza la vista de impresión para obtener una versión en papel.

## Estructura del proyecto
```
SitPlanner/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── Examples/
│   └── invitados_demo.csv
└── README.md
```

## Tecnologías
- HTML5 y CSS3
- JavaScript (ES6)
- [PapaParse](https://www.papaparse.com/) para lectura de CSV
- LocalStorage API para persistencia

## Guía de estilo
- Utilizar nombres en `camelCase` para variables y funciones.
- Mantener los identificadores en inglés de forma consistente.
- Crear funciones pequeñas con una única responsabilidad.
- Evitar estilos inline; definir estilos en archivos CSS.
- Reemplazar números mágicos por constantes descriptivas.

## Contribuir
¿Tienes ideas o encontraste un problema? Abre un *issue* o envía un *pull request*. Toda ayuda es bienvenida.

## Licencia
Este proyecto se distribuye bajo la licencia **MIT**. Puedes usarlo y adaptarlo libremente.

## Autor
Creado por **Alejandro Isnardi** (2025).
🚀 Arquitecto Cloud & Data | Chief Data Officer | Desarrollador Web Hands-on
