let map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);
let heatLayer;
let dataGlobal = [];

fetch('datos/datos.json')
  .then(res => res.json())
  .then(data => {
    dataGlobal = data;
    inicializarFiltros(data);
    actualizarVisualizacion();
  });

function inicializarFiltros(data) {
  const pais = document.getElementById('pais');
  const material = document.getElementById('material');
  // Limpiar selects
  pais.innerHTML = '<option value="todos">Todos</option>';
  material.innerHTML = '<option value="todos">Todos</option>';
  // Poblar selects
  [...new Set(data.map(d => d.pais))].forEach(p => pais.innerHTML += `<option value="${p}">${p}</option>`);
  [...new Set(data.map(d => d.material_principal))].forEach(m => material.innerHTML += `<option value="${m}">${m}</option>`);
}

// Filtros reactivos
['pais','material','masa','fechaDesde','fechaHasta'].forEach(id =>
  document.getElementById(id).addEventListener('change', actualizarVisualizacion)
);
document.querySelectorAll('input[name="vista"]').forEach(radio =>
  radio.addEventListener('change', actualizarVisualizacion)
);

function filtrarData() {
  const pais = document.getElementById('pais').value;
  const mat = document.getElementById('material').value;
  const masa = document.getElementById('masa').value;
  const fechaDesde = document.getElementById('fechaDesde').value;
  const fechaHasta = document.getElementById('fechaHasta').value;

  return dataGlobal.filter(d => {
    let ok = true;
    if (pais !== 'todos') ok = ok && d.pais === pais;
    if (mat !== 'todos') ok = ok && d.material_principal === mat;
    if (masa !== 'todos') {
      if (masa === '0-10') ok = ok && d.tamano_caida_kg >= 0 && d.tamano_caida_kg <= 10;
      if (masa === '10-50') ok = ok && d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50;
      if (masa === '50+') ok = ok && d.tamano_caida_kg > 50;
    }
    if (fechaDesde) ok = ok && d.fecha >= fechaDesde;
    if (fechaHasta) ok = ok && d.fecha <= fechaHasta;
    return ok;
  });
}

function actualizarVisualizacion() {
  const modo = document.querySelector('input[name="vista"]:checked').value;
  const filtrados = filtrarData();
  if (modo === 'puntos') {
    mostrarPuntos(filtrados);
  } else {
    mostrarMapaCalor(filtrados);
  }
}

function mostrarPuntos(data) {
  if (heatLayer) map.removeLayer(heatLayer);
  markersLayer.clearLayers();
  data.forEach(item => {
    const marker = L.marker([item.lugar_caida.lat, item.lugar_caida.lon])
      .bindPopup(`
        <b>${item.nombre}</b><br>
        País: ${item.pais}<br>
        Masa inicial: ${item.tamano_inicial_kg} kg<br>
        Masa de caída: ${item.tamano_caida_kg} kg<br>
        Material: ${item.material_principal}<br>
        Fecha: ${item.fecha || "Sin fecha"}
      `);
    markersLayer.addLayer(marker);
  });
}

function mostrarMapaCalor(data) {
  markersLayer.clearLayers();
  if (heatLayer) map.removeLayer(heatLayer);
  const puntos = data.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, 1]);
  heatLayer = L.heatLayer(puntos, { radius: 28, blur: 20, maxZoom: 8 }).addTo(map);
}
