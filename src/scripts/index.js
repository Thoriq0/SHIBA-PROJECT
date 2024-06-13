// FILE SOURCE
import "../styles/style.css";
import 'flowbite';
import 'flowbite/dist/flowbite.min.js';
import 'leaflet';
import { getEarthquakeData, getDailyBmkg, getDailyShiba, getFiveMBmkg, shibaNews} from './api.js';
import { currentInitializeMap, currentAddMarkerToMap, fiveMInitializeMap, fiveMAddMarkerToMap } from './leaflet.js';
import {processDaily, pushNews} from './dataProcessing.js';

// HOMEPAGE
const path = window.location.pathname;
if(path == '/'){
  processDaily();
  pushNews();

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
    let shibaArray = Object.values(data).reverse();

    let cardCount = 0;

    // Get current date and month
    const currentDate = new Date();
    const monthNames = ["Januari", "Februari", "Marert", "April", "May", "Juni", "Juli", "Agustis", "September", "Oktober", "November", "Desember"];
    const currentMonthName = monthNames[currentDate.getMonth()];

    const getTitle = document.querySelector('.month');
    getTitle.innerHTML = currentMonthName;

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

      // console.log(shibaArray);
  });


  // DAILY FVE
  getFiveMBmkg().then(data => {

    let fiveM = data.Infogempa.gempa;

    let getFiveMContainer = document.querySelector('.fiveM');

    let countFive = 0;

    fiveM.forEach((earth, index) => {

      let city = [{ Wilayah: earth.Wilayah }];

      function getCityName(city) {
        const word = city.split(" ");
        let cityName = word[word.length - 1];
        if (cityName.includes("-")) {
            cityName = cityName.replace("-", " ");
        }
        return cityName;
      }

      let cityName = city.map(earthQuake => getCityName(earthQuake.Wilayah));

      if(countFive < 4){
        let itemFive = `


        

        <div class="flex flex-row items-center bg-white border border-gray-200 rounded-lg shadow lg:max-w-screen-md hover:bg-gray-100">
          <img class="object-cover w-full h-52 rounded-l-lg" src="./images/p${countFive}.png" alt="Image">
          <div class="flex flex-col justify-between p-4 leading-normal">
              <h5 class="mb-2 text-2xl font-bold tracking-tight text-shiba">${cityName}</h5>
              <p class="mb-3 font-normal text-black">
                  ${earth.Tanggal} pukul ${earth.Jam}, Terjadi gempa bumi di wilayah ${earth.Wilayah}. 
                  Dengan kekuatan Magnitudo ${earth.Magnitude} dan status ${earth.Potensi}
              </p>
          </div>
      </div>



          `;
          getFiveMContainer.innerHTML += itemFive;
          countFive++;
        }
      });
  });


  // FOR NEWS
  shibaNews().then(data => {

    const firstValue = Object.values(data)[0];
    let getNewsContainer = document.querySelector('.news-shiba');

    let countNews = 0;

    firstValue.forEach((items, index) =>{

      if(countNews < 3){

        let timestamp = items.timestamp;
        let convert = parseInt(timestamp);
        let date = new Date(convert);

        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let dayOfWeek = date.getDay();

        let daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        let dayName = daysOfWeek[dayOfWeek];

        let formattedDate = `${dayName}, ${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;

        function truncateText(text, maxLength) {
          if (text.length > maxLength) {
              return text.substring(0, maxLength) + '...';
          }
          return text;
        }

        let truncatedTitle = truncateText(items.title, 55);
        console.log("Original title: ", items.title);
            console.log("Truncated title: ", truncatedTitle);

        let itemNews = `
          <div class="max-w-full bg-white rounded-xl shadow-md shadow-gray-500">
              <img class="w-full max-h-64 rounded-t-lg" src="${items.images.thumbnailProxied}" alt="Image">
              <div class="p-5">
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-shiba">${truncatedTitle}</h5>
                  <p class="mb-3 font-semibold text-black">${items.snippet}</p>
                  <a href="${items.newsUrl}" class="inline-flex items-center text-blue-600 hover:underline" target="_blank">
                      Baca Selengkapnya >>
                  </a>
                  <div class="border-t-2 border-t-gray-400 mt-4">
                      <p class="mt-3 text-sm text-gray-500">${formattedDate}</p>
                  </div>
              </div>
          </div>
        `
        getNewsContainer.innerHTML += itemNews
        countNews++;
      }
    })
  })
}


// MONTLY EARTHQUAKE
if(path == '/earthquakeMonthly.html'){
  
  // NAVBAR
  const getNavbarMonth = document.querySelector('.month-month');
  const currentDate = new Date();
  const monthNames = ["Januari", "Februari", "Marert", "April", "May", "Juni", "Juli", "Agustis", "September", "Oktober", "November", "Desember"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const monthUpperCase = monthNames[currentDate.getMonth()].toUpperCase();
  getNavbarMonth.innerHTML = monthUpperCase;

  // Title Month
  const getTitleMonth = document.querySelector('.titleMonth');
  getTitleMonth.innerHTML = currentMonthName

  function generateModal(earth, index){
    return `
    <div id="modal${index}" class="fixed inset-0 z-[9999] overflow-auto hidden md:overflow-hidden">
        <div class="flex items-center justify-center min-h-screen px-4 mt-8">
            <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full overflow-auto">
                <div class="flex justify-between items-center p-4 border-b">
                    <h3 class="text-xl font-semibold">Detail Gempa Bumi</h3>
                    <button onclick="closeModal('modal${index}')" class="text-gray-400 hover:text-gray-600">
                        <span class="text-xl">&times;</span>
                    </button>
                </div>
                <div class="p-4 flex flex-col md:flex-row">
                    <div class="md:w-2/3">
                        <ul class="list-disc pl-5">
                            <li>Tanggal : ${earth.Tanggal}</li>
                            <li>Jam : ${earth.Jam}</li>
                            <li>DateTime : ${earth.DateTime}</li>
                            <li>Coordinates : ${earth.Coordinates}</li>
                            <li>Lintang : ${earth.Lintang}</li>
                            <li>Bujur : ${earth.Bujur}</li>
                            <li>Magnitude : ${earth.Magnitude}</li>
                            <li>Kedalaman : ${earth.Kedalaman}</li>
                            <li>Wilayah : ${earth.Wilayah}</li>
                            <li>Potensi : ${earth.Potensi}</li>
                            <li>Dirasakan : ${earth.Dirasakan}</li>
                        </ul>
                    </div>
                    <div class="mt-4 md:mt-0 md:ml-4 md:w-1/3 flex justify-center">
                        <img src="https://data.bmkg.go.id/DataMKG/TEWS/${earth.Shakemap}" alt="Earthquake Image" class="rounded-lg w-full h-auto max-h-64 object-cover">
                    </div>
                </div>
                <div class="flex justify-end p-4 border-t">
                    <button onclick="closeModal('modal${index}')" class="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;
  }

  // CONTENT MONTLY EARTHQUAKE
  getDailyShiba().then(month => {
    // Convert Shiba Daily To Array
    let shibaArray = Object.values(month).reverse()

    // Container 
    const containerContent = document.querySelector('.main-content');
    const modalContainer = document.querySelector('.modal-container');

    shibaArray.forEach((earth, index) => {
      let city = [{ Wilayah: earth.Wilayah }];

      function getCityName(city) {
          const word = city.split(" ");
          let cityName = word[word.length - 1];
          if (cityName.includes("-")) {
              cityName = cityName.replace("-", " ");
          }
          const lastWord = word[word.length - 2];
          return lastWord + " " + cityName;
      }

      let cityNameArray = city.map(earthQuake => getCityName(earthQuake.Wilayah));
      let cityName = cityNameArray.join(', ');

      function truncateText(text, maxLength) {
          if (text.length > maxLength) {
              return text.substring(0, maxLength) + '...';
          }
          return text;
      }

      const truncatedCityName = truncateText(cityName, 20);

      const earthquakeElement = `
        <div class="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow">
            <div id="map${index}" class="rounded-t-lg" style="height: 200px;"></div>
            <div class="p-5">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">${truncatedCityName}</h5>
                <p class="font-normal text-gray-700">
                <ul class="list-disc pl-5">
                    <li>Tanggal : ${earth.Tanggal}</li>
                    <li>Pukul : ${earth.Jam}</li>
                    <li>Magnitudo : ${earth.Magnitude} </li>
                    <li>Kedalaman : ${earth.Kedalaman}</li>
                    <li>Potensi : ${earth.Potensi}</li>
                </ul>
                </p>
                <button onclick="openModal('modal${index}')"
                    class="mt-4 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-bluebutton rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                    <p class="text-center">Info Detail</p>
                </button>
            </div>
        </div>
        `;
        containerContent.innerHTML += earthquakeElement;

        const modalHTML = generateModal(earth, index);
        modalContainer.innerHTML += modalHTML;
    });

    shibaArray.forEach((earth, index) => {
        if (earth.Coordinates) {
            const [lat, lon] = earth.Coordinates.split(',').map(Number);
            const map = fiveMInitializeMap(index);
            fiveMAddMarkerToMap(map, lat, lon);
        } else {
            console.error(`Data gempa ke-${index} tidak memiliki koordinat.`);
        }
    });


  });


}



