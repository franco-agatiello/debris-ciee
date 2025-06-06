let datos = [];
let mapa, capaPuntos, capaCalor;
let modo = "puntos";

function filtrarDatos() {
  const pais = document.getElementById("filtroPais").value;
  const material = document.getElementById("filtroMaterial").value;
  const masa = document.getElementById("filtroMasa").value;
  const desde = document.getElementById("filtroDesde").value;
  const hasta = document.getElementById("filtroHasta").value;

  return datos.filter(d => 
    (pais === "" || d.pais === pais) &&
    (material === "" || d.material_principal === material) &&
    (masa === "" ||
      (masa === "0-10" && d.tamano_caida_kg <= 10) ||
      (masa === "10-50" && d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50) ||
      (masa === "50+" && d.tamano_caida_kg > 50)
    ) &&
    (desde === "" || d.fecha >= desde) &&
    (hasta === "" || d.fecha <= hasta)
  );
}

function actualizarMapa() {
  if (capaPuntos) mapa.removeLayer(capaPuntos);
  if (capaCalor) mapa.removeLayer(capaCalor);

  const datosFiltrados = filtrarDatos();

  if (modo === "puntos") {
    capaPuntos = L.layerGroup(datosFiltrados.map(d => 
      L.marker([d.lugar_caida.lat, d.lugar_caida.lon])
        .bindPopup(`<b>${d.nombre}</b><br>
          País: ${d.pais}<br>
          Masa inicial: ${d.tamano_inicial_kg} kg<br>
          Masa caída: ${d.tamano_caida_kg} kg<br>
          Material: ${d.material_principal}<br>
          Fecha: ${d.fecha}`))
    );
    capaPuntos.addTo(mapa);
  } else {
    const puntos = datosFiltrados.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, 1]);
    capaCalor = L.heatLayer(puntos, {radius: 25}).addTo(mapa);
  }
}

function poblarFiltros() {
  const paises = ["", ...new Set(datos.map(d => d.pais))];
  const materiales = ["", ...new Set(datos.map(d => d.material_principal))];

  const paisSel = document.getElementById("filtroPais");
  paisSel.innerHTML = paises.map(p => `<option value="${p}">${p || "Todos"}</option>`).join("");

  const materialSel = document.getElementById("filtroMaterial");
  materialSel.innerHTML = materiales.map(m => `<option value="${m}">${m || "Todos"}</option>`).join("");
}

function listeners() {
  document.querySelectorAll("#sidebar select, #sidebar input").forEach(el => {
    el.addEventListener("change", actualizarMapa);
  });
  document.getElementById("modoPuntos").onclick = () => {
    modo = "puntos";
    document.getElementById("modoPuntos").classList.add("selected");
    document.getElementById("modoCalor").classList.remove("selected");
    actualizarMapa();
  };
  document.getElementById("modoCalor").onclick = () => {
    modo = "calor";
    document.getElementById("modoCalor").classList.add("selected");
    document.getElementById("modoPuntos").classList.remove("selected");
    actualizarMapa();
  };
}

window.onload = async function() {
  mapa = L.map('mapa').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

  datos = await fetch("data/derbis.json").then(r => r.json());
  poblarFiltros();
  listeners();
  actualizarMapa();
}
