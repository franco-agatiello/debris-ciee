let derbis = [];
let mapa, capaPuntos, capaCalor, modo = "puntos";

async function cargarDatos() {
  const resp = await fetch('data/derbis.json');
  derbis = await resp.json();
  poblarFiltros();
  actualizarMapa();
}

function poblarFiltros() {
  // Rellenar selects de país y material con valores únicos
  const paises = [...new Set(derbis.map(d => d.pais))].sort();
  const materiales = [...new Set(derbis.map(d => d.material_principal))].sort();

  const paisSelect = document.getElementById('pais');
  const materialSelect = document.getElementById('material');

  paisSelect.innerHTML = '<option value="">Todos</option>' +
    paises.map(p => `<option value="${p}">${p}</option>`).join('');
  materialSelect.innerHTML = '<option value="">Todos</option>' +
    materiales.map(m => `<option value="${m}">${m}</option>`).join('');
}

function obtenerFiltros() {
  return {
    pais: document.getElementById('pais').value,
    material: document.getElementById('material').value,
    masa: document.getElementById('masa').value,
    fechaDesde: document.getElementById('fecha-desde').value,
    fechaHasta: document.getElementById('fecha-hasta').value
  };
}

function filtrarDatos() {
  const {pais, material, masa, fechaDesde, fechaHasta} = obtenerFiltros();
  return derbis.filter(d => {
    // País
    if (pais && d.pais !== pais) return false;
    // Material
    if (material && d.material_principal !== material) return false;
    // Masa
    if (masa) {
      if (masa === "0-10" && !(d.tamano_caida_kg >= 0 && d.tamano_caida_kg <= 10)) return false;
      if (masa === "10-50" && !(d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50)) return false;
      if (masa === "50+" && !(d.tamano_caida_kg > 50)) return false;
    }
    // Fechas
    if (fechaDesde && d.fecha < fechaDesde) return false;
    if (fechaHasta && d.fecha > fechaHasta) return false;
    return true;
  });
}

function actualizarMapa() {
  const datosFiltrados = filtrarDatos();
  if (capaPuntos) capaPuntos.clearLayers();
  if (capaCalor) mapa.removeLayer(capaCalor);

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
    const heatData = datosFiltrados.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, d.tamano_caida_kg/100]);
    capaCalor = L.heatLayer(heatData, {radius: 25}).addTo(mapa);
  }
}

function initMapa() {
  mapa = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
}

function listeners() {
  document.getElementById('filter-form').addEventListener('change', actualizarMapa);
  document.getElementById('modo-puntos').addEventListener('click', () => {
    modo = "puntos";
    actualizarMapa();
  });
  document.getElementById('modo-calor').addEventListener('click', () => {
    modo = "calor";
    actualizarMapa();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMapa();
  cargarDatos();
  listeners();
});
