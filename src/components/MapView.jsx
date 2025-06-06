import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";

const center = [20, 0];

function MapView({ data, mode }) {
  return (
    <MapContainer center={center} zoom={2} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mode === "puntos" ? (
        data.map((item, i) => (
          <Marker key={i} position={[item.lugar_caida.lat, item.lugar_caida.lon]}>
            <Popup>
              <strong>{item.nombre}</strong><br/>
              País: {item.pais}<br/>
              Masa original: {item.tamano_inicial_kg} kg<br/>
              Masa caída: {item.tamano_caida_kg} kg<br/>
              Material: {item.material_principal}<br/>
              Fecha: {item.fecha}
            </Popup>
          </Marker>
        ))
      ) : (
        <HeatmapLayer
          fitBoundsOnLoad
          fitBoundsOnUpdate
          points={data}
          longitudeExtractor={m => m.lugar_caida.lon}
          latitudeExtractor={m => m.lugar_caida.lat}
          intensityExtractor={m => m.tamano_caida_kg}
        />
      )}
    </MapContainer>
  );
}

export default MapView;
