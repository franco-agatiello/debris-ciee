const map = L.map('map').setView([20, 0], 2);
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
    llenarFiltros(data);
    mostrarPuntos(data);
  });

function llenarFiltros(data) {
  const paisSelect = document.getElementById('paisSelect');
  const materialSelect = document.getElementById('materialSelect');
  // Limpiar y volver a agregar la opción por defecto
  paisSelect.innerHTML = '<option value="todos">Todos</option>';
  materialSelect.innerHTML = '<option value="todos">Todos</option>';

  const paises = new Set();
  const materiales = new Set();

  data.forEach(item => {
    paises.add(item.pais);
    materiales.add(item.material_principal);
  });

  paises.forEach(p => paisSelect.innerHTML += `<option value="${p}">${p}</option>`);
  materiales.forEach(m => materialSelect.innerHTML += `<option value="${m}">${m}</option>`);
}

function filtrarData() {
  const pais = document.getElementById('paisSelect').value;
  const mat = document.getElementById('materialSelect').value;
  const rango = document.getElementById('rangoMasa').value;

  return dataGlobal.filter(d => {
    let ok = true;
    if (pais !== 'todos') ok = ok && d.pais === pais;
    if (mat !== 'todos') ok = ok && d.material_principal === mat;
    if (rango !== 'todos') {
      if (rango === '0-10') ok = ok && d.tamano_caida_kg >= 0 && d.tamano_caida_kg < 10;
      if (rango === '10-50') ok = ok && d.tamano_caida_kg >= 10 && d.tamano_caida_kg <= 50;
      if (rango === '50+') ok = ok && d.tamano_caida_kg > 50;
    }
    return ok;
  });
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
        Material: ${item.material_principal}
      `);
    markersLayer.addLayer(marker);
  });
}

function mostrarMapaCalor(data) {
  markersLayer.clearLayers();
  if (heatLayer) map.removeLayer(heatLayer);
  const puntos = data.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, 1]);
  heatLayer = L.heatLayer(puntos, { radius: 30, blur: 20, maxZoom: 8 }).addTo(map);
}

// Eventos de filtros y botones
document.getElementById('paisSelect').addEventListener('change', actualizarVista);
document.getElementById('materialSelect').addEventListener('change', actualizarVista);
document.getElementById('rangoMasa').addEventListener('change', actualizarVista);

document.getElementById('verPuntos').addEventListener('click', function() {
  this.classList.add('activo');
  document.getElementById('verMapaCalor').classList.remove('activo');
  mostrarPuntos(filtrarData());
});
document.getElementById('verMapaCalor').addEventListener('click', function() {
  this.classList.add('activo');
  document.getElementById('verPuntos').classList.remove('activo');
  mostrarMapaCalor(filtrarData());
});

function actualizarVista() {
  if (document.getElementById('verPuntos').classList.contains('activo')) {
    mostrarPuntos(filtrarData());
  } else {
    mostrarMapaCalor(filtrarData());
  }
}
