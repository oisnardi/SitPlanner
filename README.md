# 🎉 Event Seating Planner

Una **WebApp interactiva** para organizadores de eventos que permite **gestionar invitados y mesas** de manera visual, rápida y sencilla.  
Importa tus invitados desde un archivo **CSV**, asignalos a mesas con **drag & drop**, personaliza nombres y capacidades de mesas, y exporta el plan final en **CSV o JSON** listo para compartir o imprimir.

---

## ✨ Características

- 📥 **Importar CSV** con los campos: `name`, `group`, `notes`, `email`, `phone`, `company`.
- 🪑 **Mesas personalizables**: renombrar, ajustar capacidad y eliminar.
- ↔️ **Drag & Drop intuitivo**:
  - Mueve invitados entre mesas.
  - Reordena mesas con el handle `⋮⋮`.
- 🔍 **Buscador avanzado**:
  - Encuentra invitados por nombre, grupo o mesa asignada.
  - Muestra badge con la mesa donde está sentado.
- 🏷️ **Filtros por grupo**: genera "píldoras" para filtrar invitados rápidamente.
- 💾 **Guardar / Cargar**: exporta e importa el estado en JSON.
- 📊 **Exportar CSV** con asignaciones (para usar en Excel/Google Sheets).
- 🖨️ **Vista de impresión** optimizada.
- 💡 **Autosave en localStorage**: nunca pierdes tu trabajo.
- 📱 **Diseño responsive**: funciona en desktop, tablet y móvil.

---

## 🚀 Uso

1. **Abrir la aplicación**  
   Abre el archivo `index.html` (o `seating_planner.html`) en tu navegador.

2. **Importar invitados**  
   - Pulsa **"Elegir archivo CSV"**.  
   - El archivo debe contener al menos una columna `name`.  
   - Campos opcionales: `group`, `notes`, `email`, `phone`, `company`.

3. **Crear mesas**  
   - Define cantidad y capacidad por defecto.  
   - Pulsa **"Crear mesas"**.

4. **Organizar invitados**  
   - Arrastra desde el panel de invitados sin asignar hacia la mesa deseada.  
   - Usa el handle **⋮⋮** para mover invitados o reordenar mesas.  
   - Haz doble click en el **nombre** de la mesa para renombrarla.  
   - Haz doble click en el **contador** para editar capacidad.  
   - Usa 🗑️ para eliminar una mesa (los invitados regresan al panel de sin asignar).

5. **Guardar / Exportar**  
   - **Guardar JSON** para volver a cargar el plan más tarde.  
   - **Exportar CSV** con todas las asignaciones.  
   - **Vista para imprimir** para obtener una versión amigable en papel.

---

## 📂 Estructura del Proyecto
📁 Event-Seating-Planner
├── index.html # Archivo principal con HTML, CSS y JS integrados
├── README.md # Este archivo
└── assets/ # (Opcional) imágenes, iconos o estilos adicionales


---

## 📸 Capturas de pantalla

*(Agrega aquí imágenes o gifs mostrando el drag & drop y la interfaz de mesas)*

---

## ⚙️ Tecnologías usadas

- **HTML5 + CSS3** (con gradientes y estilos modernos).
- **JavaScript puro (ES6)** para lógica y drag & drop.
- **PapaParse** para la importación de CSV.
- **LocalStorage API** para autosave.

---

## 🧩 Ideas futuras

- 🔗 Integración con **Google Sheets** para importar invitados en línea.  
- 🗂️ Posibilidad de agrupar mesas por sectores (ej: salón, terraza, VIP).  
- 📱 Aplicación móvil con **capacidades offline**.  
- 🔔 Notificaciones para cambios de última hora.  
- 👥 Multiusuario para organizar en equipo.

---

## 📄 Licencia

Este proyecto está publicado bajo la licencia **MIT**.  
Eres libre de usarlo, modificarlo y adaptarlo a tus necesidades.  

---

## 👤 Autor

Creado por **Alejandro Isnardi** (2025).  
🚀 Arquitecto Cloud & Data | Chief Data Officer | Desarrollador Web Hands-on  

