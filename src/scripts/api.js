// API ENDPOINT BMKG
const bmkgDaily = process.env.API_DALYBMKG;
// const bmkgList = process.env.API_LISTBMKG;
const bmkgFiveM = process.env.API_MFIVEBMKG;

// API SHIBA 
const allSource = process.env.API_ALLPARAMSHIBA;
const shibaDaily = process.env.API_DAILYSHIBA;
const shibaList = process.env.API_LISTSHIBA;
const shibaFiveM = process.env.API_MFIVESHIBA;

// NEWS SHIBA
const news = process.env.API_NEWS;
const newShiba = process.env.API_NEWSHIBA;

export async function getAllParamShiba(){
  try{
    const response = await fetch(allSource);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}

export async function getDailyShiba(){
  try{
    const response = await fetch(shibaDaily);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}

export async function getListShiba(){
  try{
    const response = await fetch(shibaList);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}

export async function getFiveMinuteShiba(){
  try{
    const response = await fetch(shibaFiveM);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}



// BMKG

export async function getDailyBmkg(){
  try{
    const response = await fetch(bmkgDaily);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}

export async function getFiveMBmkg(){
  try{
    const response = await fetch(bmkgFiveM);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}


// NEWS
// export async function getNews(){
//   const options = {
//     method: 'GET',
//     headers: {
//       'x-rapidapi-key': process.env.NEWS_KEY,
//       'x-rapidapi-host': 'google-news13.p.rapidapi.com'
//     }
//   }
  
//   try{
//     const response = await fetch(news, options);
//     const data = await response.json();
//     return data;
//   } catch(error) {
//     console.log('Something Wrong ' + error.message);
//   }
// }

export async function shibaNews(){
  try{
    const response = await fetch(newShiba);
    const data = await response.json();
    return data;
  }
  catch(error){
    console.log('Something Wrong ' + error.message);
  }
}

// SHOWNG FOR DATA
export async function getEarthquakeData() { 
  try {
    const response = await fetch(bmkgDaily);
    if (!response.ok) {
      throw new Error('Something Problem With Response');
    }
    const data = await response.json();
    return data.Infogempa.gempa.Coordinates;
  } catch (error) {
    alert('There was a problem with the fetch operation: ' + error.message);
  }
}



