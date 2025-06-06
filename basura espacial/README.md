# derbis-ciee
# Visualizador Global de Basura Espacial

Este proyecto es una aplicación web que permite visualizar la basura espacial caída en la Tierra mediante un mapa interactivo. Los usuarios pueden filtrar los objetos espaciales por satélite, país, tamaño, material y lugar de caída, y elegir entre ver los puntos exactos o un mapa de calor.

---

## Características

- Mapa mundial con Leaflet.js
- Filtros dinámicos para satélites, países, tamaños y materiales
- Visualización en puntos o mapa de calor
- Base de datos JSON con datos estructurados de satélites y escombros
- Código abierto y escalable para futuras mejoras

---

## Archivos principales

- `index.html`: Página principal con el mapa y filtros.
- `style.css`: Estilos para la página.
- `main.js`: Lógica para cargar datos, filtrar y mostrar en el mapa.
- `datos/datos.json`: Datos de ejemplo de basura espacial.

---

## Cómo correr el proyecto localmente

1. Clonar el repositorio o descargar los archivos.
2. Abrir `index.html` en un navegador moderno (se recomienda Chrome o Firefox).
3. Interactuar con los filtros y el mapa.

> **Nota:** Para evitar problemas con CORS al cargar el JSON, es recomendable usar un servidor local simple.  
> Puedes usar Python:  
> ```bash  
> python3 -m http.server 8000  
> ```  
> Luego abrir `http://localhost:8000` en el navegador.

---

## Contribuciones

¡Las contribuciones son bienvenidas! Si quieres agregar datos, mejorar el diseño o agregar nuevas funcionalidades, por favor abre un Issue o un Pull Request.

---

## Licencia

Este proyecto está bajo la licencia CIEE.
