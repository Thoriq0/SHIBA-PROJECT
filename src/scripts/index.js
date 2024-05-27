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

// async function five(){
//   const map = fiveInitializeMap();
  
//   const coordinates = await getEarthquakeData();
//   if (coordinates) {
//     const [lat, lon] = coordinates.split(',').map(Number);
//     fiveAddMarkerToMap(map, lat, lon);
//   }
// }

// DEBUG
// fiveEarthquakeData()

fiveEarthquakeData().then(data => {
  // console.log('Data yang diterima:', data);

  const main = document.querySelector('.main');

  data.forEach((earth, index) => {
    // console.log(`Data gempa ke-${index}:`, earth);

    const earthquakeElement = `
      <div class="five-earth max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <a href="#">
          <div id="map${index}" class="rounded-t-lg" style="height: 200px;"></div>
        </a>
        <div class="p-5">
          <a href="#">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${earth.Wilayah}</h5>
          </a>
          <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Informasi gempa: Kedalaman ${earth.Kedalaman}, Koordinat ${earth.Coordinates ? earth.Coordinates : 'Tidak tersedia'}</p>
          <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Read more
            <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </a>
        </div>
      </div>
    `;
    main.innerHTML += earthquakeElement;

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