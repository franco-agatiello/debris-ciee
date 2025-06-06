let derbis = [];Add commentMore actions
let mapa, capaPuntos, capaCalor, modo = "puntos";
let leyendaPuntos, leyendaCalor;

const iconoAmarillo = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  iconSize: [18, 29],
  iconAnchor: [9, 29],
  popupAnchor: [1, -30]
});
const iconoVerde = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [18, 29],
  iconAnchor: [9, 29],
  popupAnchor: [1, -30]
});
const iconoRojo = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [18, 29],
  iconAnchor: [9, 29],
  popupAnchor: [1, -30]
});

async function cargarDatos() {
  const resp = await fetch('data/derbis.json');
@@ -9,12 +29,10 @@ async function cargarDatos() {
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
@@ -33,27 +51,29 @@ function obtenerFiltros() {
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

function marcadorPorFecha(fecha) {
  const year = parseInt(fecha.slice(0,4), 10);
  if (year < 2000) return iconoAmarillo;
  if (year <= 2018) return iconoVerde;
  return iconoRojo;
}

function actualizarMapa() {
  const datosFiltrados = filtrarDatos();

  // Limpieza de capas previas
  if (capaPuntos) {
    capaPuntos.clearLayers();
    try { mapa.removeLayer(capaPuntos); } catch (e) {}
@@ -64,10 +84,14 @@ function actualizarMapa() {
    capaCalor = null;
  }

  // Leyendas: ocultar ambas primero
  if (leyendaPuntos) leyendaPuntos.remove();
  if (leyendaCalor) leyendaCalor.remove();

  if (modo === "puntos") {
    capaPuntos = L.layerGroup();
    datosFiltrados.forEach(d => {
      const marker = L.marker([d.lugar_caida.lat, d.lugar_caida.lon])
      const marker = L.marker([d.lugar_caida.lat, d.lugar_caida.lon], {icon: marcadorPorFecha(d.fecha)})
        .bindPopup(`
          <strong>${d.nombre}</strong><br>
          País: ${d.pais}<br>
@@ -78,61 +102,65 @@ function actualizarMapa() {
      capaPuntos.addLayer(marker);
    });
    capaPuntos.addTo(mapa);
    mostrarLeyendaPuntos();
  } else {
    // Solo lat/lon para presencia, no masa
    const heatData = datosFiltrados.map(d => [d.lugar_caida.lat, d.lugar_caida.lon]);

    if (heatData.length) {
      capaCalor = L.heatLayer(heatData, {
        radius: 30,
        blur: 25,
        minOpacity: 0.4,    // Siempre queda algo de color base
        max: 30,            // Ajustá según la cantidad de datos, más alto para muchos datos
        minOpacity: 0.4,
        max: 30,
        gradient: {
          0.1: 'blue',
          0.3: 'lime',
          0.6: 'yellow',
          1.0: 'red'
        }
      }).addTo(mapa);
    } else {
      capaCalor = null;
    }
    mostrarLeyendaCalor();
  }
}

function agregarLeyenda() {
  const legend = L.control({position: 'bottomright'});
function mostrarLeyendaPuntos() {
  leyendaPuntos = L.control({position: 'bottomright'});
  leyendaPuntos.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += `<strong>Color del marcador según año de caída</strong><br>`;
    div.innerHTML += `<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png" style="width:14px;vertical-align:middle;"> <span style="color:#999">Antes de 2000</span><br>`;
    div.innerHTML += `<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" style="width:14px;vertical-align:middle;"> <span style="color:#999">2000 a 2018</span><br>`;
    div.innerHTML += `<img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" style="width:14px;vertical-align:middle;"> <span style="color:#999">2019 a Actualidad</span><br>`;
    return div;
  };
  leyendaPuntos.addTo(mapa);
}

  legend.onAdd = function (map) {
function mostrarLeyendaCalor() {
  leyendaCalor = L.control({position: 'bottomright'});
  leyendaCalor.onAdd = function (map) {
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
  leyendaCalor.addTo(mapa);
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
