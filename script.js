let mapa = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

let modoCalor = false;
let datosJSON = [];
let capaPuntos = L.layerGroup().addTo(mapa);
let capaCalor;

fetch('datos.json')
  .then(resp => resp.json())
  .then(datos => {
    datosJSON = datos;
    cargarFiltros(datos);
    actualizarMapa();
  });

function cargarFiltros(datos) {
  const paises = [...new Set(datos.map(d => d.pais))];
  const materiales = [...new Set(datos.map(d => d.material_principal))];
  const filtroPais = document.getElementById('filtroPais');
  const filtroMaterial = document.getElementById('filtroMaterial');
  filtroPais.innerHTML = '<option value="">Todos</option>' + paises.map(p => `<option>${p}</option>`).join('');
  filtroMaterial.innerHTML = '<option value="">Todos</option>' + materiales.map(m => `<option>${m}</option>`).join('');
}

function actualizarMapa() {
  capaPuntos.clearLayers();
  if (capaCalor) mapa.removeLayer(capaCalor);

  let pais = document.getElementById('filtroPais').value;
  let material = document.getElementById('filtroMaterial').value;
  let masa = document.getElementById('filtroMasa').value;
  let desde = document.getElementById('filtroDesde').value;
  let hasta = document.getElementById('filtroHasta').value;

  let filtrado = datosJSON.filter(d => {
    let condPais = pais === '' || d.pais === pais;
    let condMat = material === '' || d.material_principal === material;
    let condMasa = true;
    if (masa === '0-10') condMasa = d.tamano_caida_kg <= 10;
    if (masa === '10-50') condMasa = d.tamano_caida_kg > 10 && d.tamano_caida_kg <= 50;
    if (masa === '50+') condMasa = d.tamano_caida_kg > 50;
    let condDesde = desde === '' || d.fecha >= desde;
    let condHasta = hasta === '' || d.fecha <= hasta;
    return condPais && condMat && condMasa && condDesde && condHasta;
  });

  if (modoCalor) {
    let puntosCalor = filtrado.map(d => [d.lugar_caida.lat, d.lugar_caida.lon, 1]);
    capaCalor = L.heatLayer(puntosCalor, {radius: 25}).addTo(mapa);
  } else {
    filtrado.forEach(d => {
      L.marker([d.lugar_caida.lat, d.lugar_caida.lon])
        .bindPopup(`<b>${d.nombre}</b><br>
                    País: ${d.pais}<br>
                    Material: ${d.material_principal}<br>
                    Masa caída: ${d.tamano_caida_kg} kg<br>
                    Fecha: ${d.fecha}`)
        .addTo(capaPuntos);
    });
  }
}

document.querySelectorAll('#sidebar select, #sidebar input').forEach(el =>
  el.addEventListener('change', actualizarMapa)
);

document.getElementById('modoBtn').addEventListener('click', () => {
  modoCalor = !modoCalor;
  document.getElementById('modoBtn').innerText = modoCalor ? 'Cambiar a Modo Puntos' : 'Cambiar a Mapa de Calor';
  actualizarMapa();
});
