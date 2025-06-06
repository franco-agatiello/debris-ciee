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

function actualizarMapa() {
  const datosFiltrados = filtrarDatos();

  // Limpia ambas capas para evitar superposiciones
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
    const heatData = datosFiltrados.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, d.tamano_caida_kg/100]);
    console.log('Datos para el mapa de calor:', heatData); // <-- Debug
    if (heatData.length) {
      capaCalor = L.heatLayer(heatData, {radius: 25}).addTo(mapa);
    } else {
      capaCalor = null;
    }
  }
}

function initMapa() {
  mapa = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);
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
