import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
// import leaflet css
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { on } from "events";
// @ts-ignore
window.type = ""; // Doesn't matter what value to put here, just initialize the thing
const MapWithBoundingBox = (props: any) => {
  const [center, setCenter] = React.useState([51.505, -0.09]);

  const onCreate = (e) => {
    switch (e.layerType) {
      case "rectangle":
        const bounds = e.layer.getBounds();
        const { _northEast, _southWest } = bounds;
        const { lat, lng: east } = _northEast;
        const { lat: south, lng: west } = _southWest;
        const boundingBox = [east, south, west, lat];
        props.setBoundingBox(boundingBox);
        break;
      case "marker":
        const { lat: markerLat, lng: markerLng } = e.layer._latlng;
        props.setFakeHome([markerLat, markerLng]);
    }
  };

  useEffect(() => {}, [props]);

  return (
    <div>
      <MapContainer
        style={{ height: 300, width: 500 }}
        center={props.center}
        zoom={5}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            draw={{
              rectangle: true,
              polygon: false,
              circle: false,
              polyline: false,
              circlemarker: false,
            }}
            onCreated={(e) => onCreate(e)}
          />
        </FeatureGroup>
      </MapContainer>{" "}
    </div>
  );
};

export default MapWithBoundingBox;
