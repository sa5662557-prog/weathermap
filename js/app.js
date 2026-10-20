
// Default view: Khartoum, Sudan
const DEFAULT_COORDS = [15.5007, 32.5599];
const DEFAULT_ZOOM = 6;
// Create the map inside <div id="map">
const map = L.map("map").setView(DEFAULT_COORDS, DEFAULT_ZOOM);
// Add the map tiles (the actual map images)
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);