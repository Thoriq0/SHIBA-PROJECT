import {getAllParamShiba, getDailyShiba, getListShiba, getFiveMinuteShiba, getDailyBmkg} from './api'

async function dailyProcess(){
  try{
    const bmkg = await getDailyBmkg();
    const shiba = await getDailyShiba();
    return {bmkg, shiba};
  }
  catch(error){
    console.log(error);
  }
}

async function deleteAllData(url) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('All data successfully deleted');
  } catch (error) {
    console.log('Error:', error);
  }
}

export default async function processDaily(){

  const urlShiba = process.env.API_DAILYSHIBA

  const {bmkg, shiba} = await dailyProcess();

  console.log(bmkg.Infogempa)
  console.log(shiba);

  if (!bmkg || !shiba) {
    console.log('Failed to fetch data from BMKG or Shiba API');
    return;
  }

  const bmkgDateTime = bmkg.Infogempa.gempa.DateTime;
  const bmkgDate = new Date(bmkgDateTime);

  // Convert shiba data from object to array
  const shibaArray = Object.values(shiba);

  // Check if the month has changed
  const currentMonth = bmkgDate.getMonth();
  const currentYear = bmkgDate.getFullYear();
  const dataMonthChanged = shibaArray.some(item => {
    const itemDate = new Date(item.DateTime);
    return itemDate.getMonth() !== currentMonth || itemDate.getFullYear() !== currentYear;
  });

  if (dataMonthChanged) {
    console.log('Month has changed, deleting all data');
    await deleteAllData(urlShiba);
  }

  // Check if the DateTime from BMKG exists in Shiba data
  const exists = shibaArray.some(item => item.DateTime === bmkgDateTime);

  if (!exists) {
    console.log('No matching DateTime found in Shiba data, pushing data to API');

    // Push data to Shiba API
    async function pushDaily(bmkgData) {
      try {
        const response = await fetch(urlShiba, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bmkgData)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        console.log('Data Berhasil Dikirim');
      } catch (error) {
        console.log('Error:', error);
      }
    }

    await pushDaily(bmkg.Infogempa.gempa);
  } else {
    console.log('Matching DateTime found in Shiba data, not pushing data');
  }


}






