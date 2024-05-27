// FILE SOURCE
import "../styles/style.css";
import 'flowbite';
import 'flowbite/dist/flowbite.min.js';
import 'leaflet';
// import './api.js';
import { getEarthquakeData, fiveEarthquakeData } from './api.js';
import { currentInitializeMap, currentAddMarkerToMap, fiveAddMarkerToMap, fiveInitializeMap } from './leaflet.js';

// OUR JS FILE
// import './leaflet.js';

async function main() {
  const map = currentInitializeMap();
  
  const coordinates = await getEarthquakeData();
  if (coordinates) {
    const [lat, lon] = coordinates.split(',').map(Number);
    currentAddMarkerToMap(map, lat, lon);
  }

}

main();

// DEBUG
// fiveEarthquakeData()

fiveEarthquakeData().then(data => {
  // console.log('Data yang diterima:', data);

  const main = document.querySelector('.main');

  // Membuat elemen peta terlebih dahulu
  data.forEach((earth, index) => {
    // console.log(`Data gempa ke-${index}:`, earth);

    const earthquakeElement = `
      <div class="five-earth max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div id="map${index}" class="rounded-t-lg" style="height: 200px;"></div>
        <div class="p-5">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${earth.Wilayah}</h5>
          <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Informasi gempa: Kedalaman ${earth.Kedalaman}, Koordinat ${earth.Coordinates ? earth.Coordinates : 'Tidak tersedia'}</p>
        </div>
      </div>
    `;
    main.innerHTML += earthquakeElement;
  });

  // Setelah semua elemen peta ditambahkan ke DOM, inisialisasi petanya
  data.forEach((earth, index) => {
    if (earth.Coordinates) {
      const [lat, lon] = earth.Coordinates.split(',').map(Number);
      const map = fiveInitializeMap(index);
      fiveAddMarkerToMap(map, lat, lon);
    } else {
      console.error(`Data gempa ke-${index} tidak memiliki koordinat.`);
    }
  });

  console.log(data);
}).catch(error => {
  console.error('Error saat mengambil data gempa:', error);
});

  
// TEST
// console.log('TES :)');