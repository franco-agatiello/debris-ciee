let derbis = [];
let mapa, capaPuntos, capaCalor, modo = "puntos";

async function cargarDatos() {
  const resp = await fetch('data/derbis.json');
  derbis = await resp.json();
  poblarFiltros();
  actualizarMapa();
}

function poblarFiltros() {
  // País
  const paises = Array.from(new Set(derbis.map(d => d.pais)));
  const paisSelect = document.getElementById("pais");
  paisSelect.innerHTML = '<option value="">Todos</option>' + paises.map(p => `<option value="${p}">${p}</option>`).join('');

  // Material
  const materiales = Array.from(new Set(derbis.map(d => d.material_principal)));
  const materialSelect = document.getElementById("material");
  materialSelect.innerHTML = '<option value="">Todos</option>' + materiales.map(m => `<option value="${m}">${m}</option>`).join('');
}

function obtenerFiltros() {
  return {
    pais: document.getElementById("pais").value,
    material: document.getElementById("material").value,
    masa: document.getElementById("masa").value,
    fechaDesde: document.getElementById("fecha-desde").value,
    fechaHasta: document.getElementById("fecha-hasta").value
  };
}

function filtrarDatos() {
  const filtros = obtenerFiltros();
  return derbis.filter(d => {
    // filtro país
    if (filtros.pais && d.pais !== filtros.pais) return false;
    // filtro material
    if (filtros.material && d.material_principal !== filtros.material) return false;
    // filtro masa
    if (filtros.masa) {
      if (filtros.masa === "0-10" && !(d.tamano_caida_kg >= 0 && d.tamano_caida_kg <= 10)) return false;
      if (filtros.masa === "10-50" && !(d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50)) return false;
      if (filtros.masa === "50+" && !(d.tamano_caida_kg > 50)) return false;
    }
    // filtro fecha
    if (filtros.fechaDesde && d.fecha < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && d.fecha > filtros.fechaHasta) return false;
    return true;
  });
}

// Calibración automática del 'max' para el heatmap basado en densidad local
function calcularMaxDensidad(heatData, cellSize = 1) {
  // cellSize en grados. 1 = 1 grado lat/lon
  const grid = {};
  let max = 0;
  heatData.forEach(([lat, lon]) => {
    // Redondea a la celda más cercana
    const latCell = Math.round(lat / cellSize);
    const lonCell = Math.round(lon / cellSize);
    const key = `${latCell}_${lonCell}`;
    grid[key] = (grid[key] || 0) + 1;
    if (grid[key] > max) max = grid[key];
  });
  return max || 1; // Para evitar max=0 si no hay datos
}

function actualizarMapa() {
  const datosFiltrados = filtrarDatos();

  // Limpieza de capas previas
  if (capaPuntos) {
    capaPuntos.clearLayers();
    try { mapa.removeLayer(capaPuntos); } catch (e) {}
    capaPuntos = null;
  }
  if (capaCalor && mapa.hasLayer(capaCalor)) {
    mapa.removeLayer(capaCalor);
    capaCalor = null;
  }

  if (modo === "puntos") {
    capaPuntos = L.layerGroup();
    datosFiltrados.forEach(d => {
      const marker = L.marker([d.lugar_caida.lat, d.lugar_caida.lon])
        .bindPopup(`
          <strong>${d.nombre}</strong><br>
          País: ${d.pais}<br>
          Masa caída: ${d.tamano_caida_kg} kg<br>
          Material: ${d.material_principal}<br>
          Fecha: ${d.fecha}
        `);
      capaPuntos.addLayer(marker);
    });
    capaPuntos.addTo(mapa);
  } else {
    // Cada punto suma 1 al calor
    const heatData = datosFiltrados.map(d => [d.lugar_caida.lat, d.lugar_caida.lon]);
    if (heatData.length) {
      // Calibración automática de la escala de calor
      const maxDensidad = calcularMaxDensidad(heatData, 1); // 1 grado de celda
      capaCalor = L.heatLayer(heatData, {
        radius: 32,
        blur: 30,
        maxZoom: 2,
        max: maxDensidad,
        gradient: {
          0.0: 'rgba(0,0,255,0.12)', // azul transparente, fondo frío
          0.2: 'blue',
          0.4: 'lime',
          0.6: 'yellow',
          1.0: 'red'
        }
      }).addTo(mapa);
    } else {
      capaCalor = null;
    }
  }
}

function agregarLeyenda() {
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = ['Bajo', 'Medio', 'Alto', 'Muy alto'];
    const colors = ['blue', 'lime', 'yellow', 'red'];
    div.innerHTML += '<strong>Densidad de caídas</strong><br>';
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        `<i style="background:${colors[i]};width:18px;height:18px;display:inline-block;margin-right:6px;"></i> ${grades[i]}<br>`;
    }
    return div;
  };
  legend.addTo(mapa);
}

function initMapa() {
  mapa = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
  agregarLeyenda();
}

function listeners() {
  // Filtros
  ["pais", "material", "masa", "fecha-desde", "fecha-hasta"].forEach(id => {
    document.getElementById(id).addEventListener("change", actualizarMapa);
  });

  // Botones modo
  document.getElementById("modo-puntos").addEventListener("click", () => {
    modo = "puntos";
    actualizarMapa();
  });
  document.getElementById("modo-calor").addEventListener("click", () => {
    modo = "calor";
    actualizarMapa();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMapa();
  cargarDatos();
  listeners();
});
