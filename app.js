let datos = [];
let mapa, capaPuntos, capaCalor;

const $ = (id) => document.getElementById(id);

function mostrarLoading(mostrar) {
  $("loading").classList.toggle("d-none", !mostrar);
}

function cargarDatos() {
  mostrarLoading(true);
  fetch("data.json")
    .then(r => r.json())
    .then(json => {
      datos = json;
      inicializarFiltros();
      actualizarMapa();
    })
    .finally(() => mostrarLoading(false));
}

function inicializarFiltros() {
  // Llenar país y material con opciones únicas
  const paises = [...new Set(datos.map(d => d.pais))].sort();
  const materiales = [...new Set(datos.map(d => d.material_principal))].sort();

  $("filtro-pais").innerHTML = paises.map(p =>
    `<option value="${p}">${p}</option>`).join("");
  $("filtro-material").innerHTML = materiales.map(m =>
    `<option value="${m}">${m}</option>`).join("");
}

function obtenerFiltros() {
  // Multi-selects: obtener como array
  const paises = Array.from($("filtro-pais").selectedOptions).map(o => o.value);
  const materiales = Array.from($("filtro-material").selectedOptions).map(o => o.value);
  const masa = $("filtro-masa").value;
  const modo = $("filtro-modo").value;
  const fechaDesde = $("filtro-fecha-desde").value;
  const fechaHasta = $("filtro-fecha-hasta").value;
  return { paises, materiales, masa, modo, fechaDesde, fechaHasta };
}

function filtrarDatos() {
  const { paises, materiales, masa, fechaDesde, fechaHasta } = obtenerFiltros();
  return datos.filter(d => {
    if (paises.length && !paises.includes(d.pais)) return false;
    if (materiales.length && !materiales.includes(d.material_principal)) return false;
    if (masa) {
      if (masa === "0-10" && !(d.tamano_caida_kg >= 0 && d.tamano_caida_kg <= 10)) return false;
      if (masa === "10-50" && !(d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50)) return false;
      if (masa === "50+" && !(d.tamano_caida_kg > 50)) return false;
    }
    if (fechaDesde && d.fecha < fechaDesde) return false;
    if (fechaHasta && d.fecha > fechaHasta) return false;
    return true;
  });
}

function crearPopup(d) {
  return `
    <strong>${d.nombre}</strong><br>
    <b>País:</b> ${d.pais}<br>
    <b>Masa original:</b> ${d.tamano_inicial_kg} kg<br>
    <b>Masa caída:</b> ${d.tamano_caida_kg} kg<br>
    <b>Material:</b> ${d.material_principal}<br>
    <b>Fecha:</b> ${d.fecha}<br>
    <b>Ubicación:</b> [${d.lugar_caida.lat.toFixed(3)}, ${d.lugar_caida.lon.toFixed(3)}]
  `;
}

function actualizarMapa() {
  const filtrados = filtrarDatos();
  $("num-resultados").textContent = `${filtrados.length} derbis encontrados`;
  const modo = $("filtro-modo").value;

  // Eliminar capas previas
  if (capaPuntos) capaPuntos.clearLayers();
  if (capaCalor) mapa.removeLayer(capaCalor);

  if (modo === "puntos") {
    capaPuntos = L.layerGroup();
    filtrados.forEach(d => {
      const marker = L.marker([d.lugar_caida.lat, d.lugar_caida.lon]);
      marker.bindPopup(crearPopup(d));
      capaPuntos.addLayer(marker);
    });
    capaPuntos.addTo(mapa);
  } else {
    // Modo calor
    const heatData = filtrados.map(d =>
      [d.lugar_caida.lat, d.lugar_caida.lon, Math.max(1, d.tamano_caida_kg / 10)]
    );
    capaCalor = L.heatLayer(heatData, { radius: 25, blur: 15, maxZoom: 7 }).addTo(mapa);
  }
}

function inicializarMapa() {
  mapa = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 10,
    attribution: '© OpenStreetMap'
  }).addTo(mapa);
  capaPuntos = L.layerGroup().addTo(mapa);
}

function setupEventos() {
  $("filtros-form").addEventListener("change", () => actualizarMapa());
}

window.onload = function () {
  inicializarMapa();
  setupEventos();
  cargarDatos();
};
