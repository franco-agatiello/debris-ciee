# Dashboard Interactivo de Derbis Espaciales

Aplicación web interactiva para visualizar y analizar información de satélites y derbis espaciales caídos en la Tierra.

## Funcionalidades principales

- **Visualización geográfica:** Mapa mundial (Leaflet) con alternancia entre modo “puntos” y “mapa de calor”.
- **Filtros combinables:** Por país, material, rango de masa y fechas.
- **Datos desde JSON:** Los datos de los satélites y derbis se cargan desde un archivo JSON.
- **Experiencia profesional:** UI moderna, responsiva y reactiva.

## Scripts básicos

```bash
npm install
npm start
```

## Estructura de carpetas

- `public/`: Archivos estáticos, incluyendo `derbis.json`
- `src/components/`: Componentes reutilizables (Mapa, Filtros, Sidebar, etc.)
- `src/context/`: Contextos React para estado global (filtros, datos)
- `src/utils/`: Utilidades y helpers
- `src/App.jsx`: Componente principal

## Licencia

Este proyecto está bajo la licencia CIEE.
