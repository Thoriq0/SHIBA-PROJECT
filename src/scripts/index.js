// FILE SOURCE
import "../styles/style.css";
import 'flowbite';
import 'flowbite/dist/flowbite.min.js';
import 'leaflet';
import { getEarthquakeData, getDailyBmkg, getDailyShiba} from './api.js';
import { currentInitializeMap, currentAddMarkerToMap } from './leaflet.js';
import processDaily from './dataProcessing.js';


// HOMEPAGE
const path = window.location.pathname;
if(path == '/'){
  processDaily();

  // DAILY SHOW 
  getDailyBmkg().then(data => {
    // console.log(data);

    // LEFT SIDE (IMAGE)
    const getContainer = document.querySelector(".image-map");
    const image = `
    <img src="https://data.bmkg.go.id/DataMKG/TEWS/${data.Infogempa.gempa.Shakemap}" alt="shakemap" class="w-full h-full object-cover">
    `
    getContainer.innerHTML += image;

    // RIGHT SIDE (INFORMATION)
    const getC = document.querySelector('.information-daily');

    const showInformation = `
    <p>
      Pada Tanggal ${data.Infogempa.gempa.Tanggal} pukul ${data.Infogempa.gempa.Jam}, Terjadi gempa bumi
      di wilayah ${data.Infogempa.gempa.Wilayah}. Gempa tersebut memiliki kekuatan Magnitudo ${data.Infogempa.gempa.Magnitude} dengan kedalaman ${data.Infogempa.gempa.Kedalaman}
    </p>
    `
    getC.innerHTML += showInformation;

  });

  // DAILY MAP
  async function main() {
    const map = currentInitializeMap();
    const coordinates = await getEarthquakeData();
    if (coordinates) {
      const [lat, lon] = coordinates.split(',').map(Number);
      currentAddMarkerToMap(map, lat, lon);
    }
  }
  main();


  // Get Data For Showing to index
  getDailyShiba().then(data => {
    // Convert Shiba Daily To Array
    let shibaArray = Object.values(data);

    let cardCount = 0;

    // Get current date and month
    const currentDate = new Date();
    const monthNames = ["Januari", "Februari", "Marert", "April", "May", "Juni", "Juli", "Agustis", "September", "Oktober", "November", "Desember"];
    const currentMonthName = monthNames[currentDate.getMonth()];

    const getTitle = document.querySelector('.month');
    getTitle.innerHTML = "("+currentMonthName+")";

    shibaArray.forEach(item => {
      let city = [{ Wilayah: item.Wilayah }];

      function getCityName(city) {
          const word = city.split(" ");
          let cityName = word[word.length - 1];
          if (cityName.includes("-")) {
              cityName = cityName.replace("-", " ");
          }
          const lastWord = word[word.length - 2];
          return lastWord + " " + cityName;
      }

      let cityName = city.map(earthQuake => getCityName(earthQuake.Wilayah));

      if (cardCount < 4) {
          // Check if cityName contains "LAUT" or "laut"
          let imageUrl = "./images/darat.jpg";
          if (cityName.some(name => name.toUpperCase().includes("LAUT"))) {
              imageUrl = "./images/laut.jpg";
          }

          let getCardGrid = document.querySelector('.monthly-grid');
          let createCard = `
              <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img class="w-full h-48 object-cover" src="${imageUrl}" alt="${cityName}">
                  <div class="p-6">
                      <h3 class="text-xl font-bold mb-2">${cityName}</h3>
                      <p class="text-gray-700">${item.Tanggal} - ${item.Jam}</p>
                  </div>
              </div>
          `;
          getCardGrid.innerHTML += createCard;

          cardCount++;
      }

    });

      console.log(shibaArray);
  });


}





