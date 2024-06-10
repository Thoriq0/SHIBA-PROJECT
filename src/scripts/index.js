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

}

getDailyShiba().then(data => {

  // Convert Shiba Daily To Array
  let shibaArray = Object.values(data);

  
  
});



