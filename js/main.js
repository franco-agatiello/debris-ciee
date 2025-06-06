// Cargar el mapa
const map = L.map('map').setView([0, 0], 2);
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
  const satSelect = document.getElementById('satSelect');
  const paises = new Set();
  const materiales = new Set();
  const sats = new Set();

  data.forEach(item => {
    paises.add(item.pais);
    materiales.add(item.material_principal);
    sats.add(item.nombre);
  });

  paises.forEach(p => paisSelect.innerHTML += `<option value="${p}">${p}</option>`);
  materiales.forEach(m => materialSelect.innerHTML += `<option value="${m}">${m}</option>`);
  sats.forEach(s => satSelect.innerHTML += `<option value="${s}">${s}</option>`);
}

function mostrarPuntos(data) {
  markersLayer.clearLayers();
  data.forEach(item => {
    const marker = L.marker([item.lugar_caida.lat, item.lugar_caida.lon])
      .bindPopup(`<b>${item.nombre}</b><br>${item.pais}<br>${item.material_principal}`);
    markersLayer.addLayer(marker);
  });
}

function mostrarMapaCalor(data) {
  if (heatLayer) {
    map.removeLayer(heatLayer);
  }
  const puntos = data.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, 1]);
  heatLayer = L.heatLayer(puntos, { radius: 25 }).addTo(map);
}

function aplicarFiltros() {
  const pais = document.getElementById('paisSelect').value;
  const sat = document.getElementById('satSelect').value;
  const mat = document.getElementById('materialSelect').value;
  const tinMin = parseFloat(document.getElementById('tamanoInicial').value) || -Infinity;
  const tinMax = parseFloat(document.getElementById('tamanoInicialMax').value) || Infinity;
  const tcaMin = parseFloat(document.getElementById('tamanoCaida').value) || -Infinity;
  const tcaMax = parseFloat(document.getElementById('tamanoCaidaMax').value) || Infinity;

  const filtrado = dataGlobal.filter(d => {
    return (pais === 'todos' || d.pais === pais) &&
           (sat === 'todos' || d.nombre === sat) &&
           (mat === 'todos' || d.material_principal === mat) &&
           d.tamano_inicial_kg >= tinMin && d.tamano_inicial_kg <= tinMax &&
           d.tamano_caida_kg >= tcaMin && d.tamano_caida_kg <= tcaMax;
  });

  mostrarPuntos(filtrado);
  if (heatLayer) map.removeLayer(heatLayer);
}

// Eventos

document.getElementById('aplicarFiltros').addEventListener('click', aplicarFiltros);
document.getElementById('verMapaCalor').addEventListener('click', () => {
  aplicarFiltros();
  mostrarMapaCalor(dataGlobal.filter(d => markersLayer.hasLayer(L.marker([d.lugar_caida.lat, d.lugar_caida.lon]))));
});
document.getElementById('verPuntos').addEventListener('click', aplicarFiltros);
