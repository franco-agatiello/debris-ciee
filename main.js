let derbis = [];
let mapa, capaPuntos, capaCalor, modo = "puntos";

async function cargarDatos() {
  const resp = await fetch('data/derbis.json');
  derbis = await resp.json();
  poblarFiltros();
  actualizarMapa();
}

function poblarFiltros() {
  // Rellena selects de país/material con opciones únicas de los datos
  // ...
}

function obtenerFiltros() {
  // Lee los filtros del DOM y devuelve un objeto
}

function filtrarDatos() {
  // Por ahora, simplemente devolvemos todos los datos.
  // Aquí luego puedes implementar el filtrado real.
  return derbis;
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
  // Listeners para los filtros y botones
  // Al cambiar, llama a actualizarMapa()
}

document.addEventListener("DOMContentLoaded", () => {
  initMapa();
  cargarDatos();
  listeners();
});
