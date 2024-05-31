// FILE SOURCE
import "../styles/style.css";
import 'flowbite';
import 'flowbite/dist/flowbite.min.js';
import 'leaflet';
import { getEarthquakeData} from './api.js';
import { currentInitializeMap, currentAddMarkerToMap } from './leaflet.js';

// OUR JS FILE
// import './leaflet.js';


// DAILY 
async function main() {
  const map = currentInitializeMap();
  
  const coordinates = await getEarthquakeData();
  if (coordinates) {
    const [lat, lon] = coordinates.split(',').map(Number);
    currentAddMarkerToMap(map, lat, lon);
  }

}

main();

// TEST
// console.log('Hello Coders! :)');