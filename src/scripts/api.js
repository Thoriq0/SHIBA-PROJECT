
// DAILY
export async function getEarthquakeData() {
  try {
    const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    if (!response.ok) {
      throw new Error('Something Problem With Response');
    }
    const data = await response.json();
    return data.Infogempa.gempa.Coordinates;
  } catch (error) {
    alert('There was a problem with the fetch operation: ' + error.message);
  }
}
