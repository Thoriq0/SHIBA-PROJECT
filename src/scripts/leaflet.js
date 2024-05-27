import L from 'leaflet';
import { fiveEarthquakeData } from './api';



export function currentInitializeMap() {
  const map = L.map('map').setView([-6.200000, 106.816666], 5); // Lokasi awal di Jakarta

  // Tambahkan layer tile dari OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
    // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  return map;
}

export function currentAddMarkerToMap(map, lat, lon) {

  const myIcon = L.icon({
    iconUrl: '/icon/warning.png',
    iconSize: [40, 40],
    iconAnchor: [32, 54],
    popupAnchor: [0, -54]
  });

  L.marker([lat, lon], {icon: myIcon}).addTo(map)
    .bindPopup(`<b>Koordinat Gempa:</b><br>Latitude: ${lat}<br>Longitude: ${lon}`)
    .openPopup();

  L.circle([lat, lon], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(map);

  // Pusatkan peta di koordinat gempa
  map.setView([lat, lon], 13);
}

export function fiveInitializeMap(index) {
  const map = L.map(`map${index}`).setView([-6.200000, 106.816666], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 30
    // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  return map;
}

export function fiveAddMarkerToMap(map, lat, lon){
  const myIcon = L.icon({
    iconUrl: '/icon/warning.png',
    iconSize: [40, 40],
    iconAnchor: [32, 54],
    popupAnchor: [0, -54]
  });

  L.marker([lat, lon], {icon: myIcon}).addTo(map)
    .bindPopup(`<b>Koordinat Gempa:</b><br>Latitude: ${lat}<br>Longitude: ${lon}`)
    .openPopup();
    
  // Pusatkan peta di koordinat gempa
  map.setView([lat, lon], 10);
}