
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

export async function fiveEarthquakeData() {

  try{
    const response = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
    if (!response.ok) {
      throw new Error('Something Problem With Response');
    }
    const data = await response.json();
    return data.Infogempa.gempa;
    
    // DEBUG
    // const getAll = data.Infogempa.gempa;
    // return console.log(getAll.length)
  }
  catch (error) {
    alert('There was a problem with the fetch operation: ' + error.message);
  }
}


