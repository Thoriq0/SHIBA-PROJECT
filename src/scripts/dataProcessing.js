import {
  getAllParamShiba,
  getDailyShiba,
  getDailyBmkg,
  shibaNews,
} from "./api";

async function dailyProcess() {
  try {
    const bmkg = await getDailyBmkg();
    const shiba = await getDailyShiba();
    // console.log(bmkg);
    // console.log(shiba);
    return { bmkg, shiba };
  } catch (error) {
    console.log(error);
  }
}

async function deleteFilteredData(url, data) {
  try {
    const dataLength = data.length;
    const dataToKeep = data.slice(-4); // Ambil 4 objek terakhir dari array data

    if (dataLength <= 4) {
      console.log("No need to delete, keeping all data");
      return;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToKeep),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log(
      "Data successfully deleted, keeping the last 4 items:",
      dataToKeep
    );
  } catch (error) {
    console.log("Error in deleteFilteredData:", error);
  }
}

export async function processDaily() {
  const urlShiba = process.env.API_DAILYSHIBA;

  try {
    const { bmkg, shiba } = await dailyProcess();

    if (!bmkg || !shiba) {
      console.log("Failed to fetch data from BMKG or Shiba API");
      return;
    }

    const bmkgDateTime = bmkg.Infogempa.gempa.DateTime;
    const bmkgDate = new Date(bmkgDateTime);

    const shibaArray = Object.values(shiba);
    if (shibaArray.length === 0) {
      console.log("Shiba data array is empty.");
      return;
    }

    const currentMonth = bmkgDate.getMonth();
    const currentYear = bmkgDate.getFullYear();
    const dataMonthChanged = shibaArray.some((item) => {
      const itemDate = new Date(item.DateTime);
      return (
        itemDate.getMonth() !== currentMonth ||
        itemDate.getFullYear() !== currentYear
      );
    });

    if (dataMonthChanged) {
      console.log(
        "Month has changed, filtering and deleting data if necessary"
      );
      await deleteFilteredData(urlShiba, shibaArray);
    }

    const exists = shibaArray.some((item) => item.DateTime === bmkgDateTime);

    if (!exists) {
      console.log(
        "No matching DateTime found in Shiba data, pushing data to API"
      );

      async function pushDaily(bmkgData) {
        try {
          const response = await fetch(urlShiba, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bmkgData),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          console.log("Data Berhasil Dikirim");
        } catch (error) {
          console.log("Error in pushDaily:", error);
        }
      }

      await pushDaily(bmkg.Infogempa.gempa);
    } else {
      console.log("Matching DateTime found in Shiba data, not pushing data");
    }
  } catch (error) {
    console.log("Error in processDaily:", error);
  }
}

// NEWS

// FOR TESTING FAKE DATE
// class DateWrapper {
//   constructor() {
//     this._currentDate = new Date();
//   }

//   // Method untuk mendapatkan waktu saat ini
//   now() {
//     return this._currentDate;
//   }

//   // Method untuk mengatur waktu
//   setCurrentDate(date) {
//     this._currentDate = new Date(date);
//   }
// }

async function getNews() {
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.NEWS_KEY,
      "x-rapidapi-host": "google-news13.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(process.env.API_NEWS, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const news = responseData.items;

    if (!Array.isArray(news)) {
      console.log("Received data is not an array:", news);
      throw new Error("Received data is not an array");
    }

    return news;
  } catch (error) {
    console.log("Error in getNews:", error.message);
    throw error;
  }
}

async function deleteNonTesData(url, data) {
  try {
    const filteredData = data.filter((item) => item.tes === "");

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log("All non-tes data successfully deleted");
  } catch (error) {
    console.log("Error in deleteNonTesData:", error);
    throw error;
  }
}

let lastPushTime = null;

export async function pushNews() {
  // TESTING FAKE DATE
  // const dateWrapper = new DateWrapper();
  // function getCurrentTime() {
  //   return dateWrapper.now();
  // }
  // dateWrapper.setCurrentDate('2024-06-14T07:00:00Z');
  // console.log(getCurrentTime());

  const currentDate = new Date();
  const dayOfMonth = currentDate.getDate();
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const currentSecond = currentDate.getSeconds();

  if (
    dayOfMonth % 2 === 0 &&
    currentHour >= 7 &&
    currentMinute === 0 &&
    currentSecond === 0
  ) {
    try {
      if (lastPushTime === dayOfMonth) {
        console.log("Data telah diperbaharui pada pukul 7 hari ini.");
        return;
      }

      const news = await getNews();

      if (!Array.isArray(news)) {
        console.log("Received data is not an array:", news);
        throw new Error("Received data is not an array");
      }

      await deleteNonTesData(process.env.API_NEWSHIBA, news);

      const response = await fetch(process.env.API_NEWSHIBA, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(news),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Response from API:", responseData);

      // Update lastPushTime ke hari ini
      lastPushTime = dayOfMonth;
    } catch (error) {
      console.log("Error in pushNews:", error);
    }
  } else {
    // console.log('Hari ini tanggal ganjil atau belum pukul 7, tidak ada pengiriman berita.');
    // console.log(new DateWrapper().now())
  }
}
