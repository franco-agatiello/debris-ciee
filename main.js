let derbis = [];
let mapa, capaPuntos, capaCalor, modo = "puntos";

// Cargar datos JSON y poblar filtros
async function cargarDatos() {
  try {
    const resp = await fetch('./data/derbis.json');
    if (!resp.ok) throw new Error('No se pudo cargar el JSON');
    derbis = await resp.json();
    if (!Array.isArray(derbis)) derbis = [];
    console.log('derbis cargados:', derbis);
    poblarFiltros();
    actualizarMapa();
  } catch(e) {
    console.error('Error cargando el JSON:', e);
    derbis = [];
    poblarFiltros();
    actualizarMapa();
  }
}

// Poblar los selects de país y material con opciones únicas
function poblarFiltros() {
  // Países únicos
  const paises = [...new Set(derbis.map(d => d.pais))].sort();
  const paisSelect = document.getElementById('pais');
  paisSelect.innerHTML = '<option value="">Todos</option>';
  paises.forEach(p => {
    paisSelect.innerHTML += `<option value="${p}">${p}</option>`;
  });

  // Materiales únicos
  const materiales = [...new Set(derbis.map(d => d.material_principal))].sort();
  const materialSelect = document.getElementById('material');
  materialSelect.innerHTML = '<option value="">Todos</option>';
  materiales.forEach(m => {
    materialSelect.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

// Devuelve los valores de los filtros actuales
function obtenerFiltros() {
  return {
    pais: document.getElementById('pais').value,
    material: document.getElementById('material').value,
    masa: document.getElementById('masa').value,
    fechaDesde: document.getElementById('fecha-desde').value,
    fechaHasta: document.getElementById('fecha-hasta').value
  };
}

// Filtra los datos según los filtros seleccionados
function filtrarDatos() {
  if (!Array.isArray(derbis)) return [];
  const { pais, material, masa, fechaDesde, fechaHasta } = obtenerFiltros();
  return derbis.filter(d => {
    let ok = true;
    if (pais && d.pais !== pais) ok = false;
    if (material && d.material_principal !== material) ok = false;
    if (masa) {
      if (masa === "0-10" && !(d.tamano_caida_kg >= 0 && d.tamano_caida_kg <= 10)) ok = false;
      if (masa === "10-50" && !(d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50)) ok = false;
      if (masa === "50+" && !(d.tamano_caida_kg > 50)) ok = false;
    }
    if (fechaDesde && d.fecha < fechaDesde) ok = false;
    if (fechaHasta && d.fecha > fechaHasta) ok = false;
    return ok;
  });
}

// Actualiza el mapa según el modo y los filtros
function actualizarMapa() {
  const datosFiltrados = filtrarDatos();
  // Limpia las capas anteriores
  if (capaPuntos) {
    capaPuntos.clearLayers();
    mapa.removeLayer(capaPuntos);
  }
  if (capaCalor) {
    mapa.removeLayer(capaCalor);
  }

  if (modo === "puntos") {
    capaPuntos = L.layerGroup();
    datosFiltrados.forEach(d => {
      if (!d.lugar_caida) return;
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
    // Para el mapa de calor
    const heatData = datosFiltrados
      .filter(d => d.lugar_caida)
      .map(d => [d.lugar_caida.lat, d.lugar_caida.lon, Math.max(0.2, d.tamano_caida_kg / 100)]);
    capaCalor = L.heatLayer(heatData, { radius: 25 }).addTo(mapa);
  }
}

// Inicializa el mapa Leaflet
function initMapa() {
  mapa = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "© OpenStreetMap"
  }).addTo(mapa);
}

// Agrega los listeners
function listeners() {
  // Filtros reactivos
  ['pais', 'material', 'masa', 'fecha-desde', 'fecha-hasta'].forEach(id => {
    document.getElementById(id).addEventListener('change', actualizarMapa);
  });
  // Botones de modo
  document.getElementById('modo-puntos').addEventListener('click', () => {
    modo = "puntos";
    actualizarMapa();
  });
  document.getElementById('modo-calor').addEventListener('click', () => {
    modo = "calor";
    actualizarMapa();
  });
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  initMapa();
  cargarDatos();
  listeners();
