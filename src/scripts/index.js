// FILE SOURCE
import "../styles/style.css";
import "flowbite";
import "flowbite/dist/flowbite.min.js";
import "leaflet";
import "lazysizes";
import "lazysizes/plugins/parent-fit/ls.parent-fit";
import {
  getEarthquakeData,
  getDailyBmkg,
  getDailyShiba,
  getFiveMBmkg,
  shibaNews,
  shibaNewsByMonth,
} from "./api.js";
import {
  currentInitializeMap,
  currentAddMarkerToMap,
  fiveMInitializeMap,
  fiveMAddMarkerToMap,
} from "./leaflet.js";

const path = window.location.pathname;
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
let pageLoaderHandled = false;

function dismissStartupLoader() {
  document.documentElement.classList.remove("startup-loading");
  const startupLoader = document.querySelector(".startup-loader");

  if (startupLoader) {
    startupLoader.setAttribute("aria-hidden", "true");
  }
}

function matchesPath(...candidates) {
  return candidates.some((candidate) => {
    if (candidate === "/") {
      return path === "/" || path.endsWith("index.html");
    }

    return path === candidate || path.endsWith(candidate.replace(/^\//, ""));
  });
}

function showPageLoader() {
  pageLoaderHandled = true;
  dismissStartupLoader();

  const body = document.querySelector("body");
  const load = document.querySelector(".conload");

  if (body) {
    body.style.overflow = "hidden";
  }

  if (load) {
    load.style.display = "flex";
  }
}

function hidePageLoader() {
  dismissStartupLoader();

  const body = document.querySelector("body");
  const load = document.querySelector(".conload");

  if (load) {
    load.style.display = "none";
  }

  if (body) {
    body.style.overflow = "auto";
  }
}

function getPrimaryArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  if (data.items && typeof data.items === "object") {
    return Array.isArray(data.items) ? data.items : Object.values(data.items);
  }

  const firstValue = Object.values(data)[0];

  if (Array.isArray(firstValue)) {
    return firstValue;
  }

  return Object.values(data).filter(
    (item) => item && typeof item === "object" && !Array.isArray(item)
  );
}

function truncateText(text, maxLength) {
  const safeText = typeof text === "string" ? text : "";

  if (safeText.length > maxLength) {
    return `${safeText.substring(0, maxLength)}...`;
  }

  return safeText;
}

function formatNewsDate(timestamp) {
  const convertedTime = Number.parseInt(timestamp, 10);
  const date = new Date(convertedTime);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dayOfWeek = date.getDay();
  const daysOfWeek = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  return `${daysOfWeek[dayOfWeek]}, ${day < 10 ? "0" + day : day}-${
    month < 10 ? "0" + month : month
  }-${year}`;
}

function getCityNameLabel(city, includePreviousWord = true) {
  if (typeof city !== "string" || city.trim() === "") {
    return "Lokasi tidak tersedia";
  }

  const words = city.trim().split(/\s+/);
  let cityName = words[words.length - 1] || "";

  if (cityName.includes("-")) {
    cityName = cityName.replace("-", " ");
  }

  if (!includePreviousWord || words.length < 2) {
    return cityName;
  }

  const lastWord = words[words.length - 2];
  return `${lastWord} ${cityName}`.trim();
}

function appendNewsCards(container, items, maxItems) {
  if (!container || !Array.isArray(items)) {
    return;
  }

  items.slice(0, maxItems).forEach((item) => {
    const formattedDate = formatNewsDate(item?.timestamp);
    const truncatedTitle = truncateText(item?.title, 55);
    const imageUrl =
      item?.images?.thumbnail ||
      item?.images?.thumbnailProxied ||
      "./images/shiba.png";
    const snippet = item?.snippet || "Ringkasan berita tidak tersedia.";
    const newsUrl = item?.newsUrl || "#";

    const itemNews = `
      <div class="max-w-full bg-white rounded-xl shadow-md shadow-gray-500">
          <img
              class="w-full max-h-64 rounded-t-lg object-cover"
              src="${imageUrl}"
              loading="lazy"
              alt="${truncatedTitle || "Berita SHIBA"}"
              onerror="this.onerror=null;this.src='./images/shiba.png';">
          <div class="p-5">
              <h5 class="mb-2 text-2xl font-bold tracking-tight text-shiba">${truncatedTitle || "Judul tidak tersedia"}</h5>
              <p class="mb-3 font-semibold text-black">${snippet}</p>
              <a href="${newsUrl}" class="inline-flex items-center text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Baca Selengkapnya >>
              </a>
              <div class="border-t-2 border-t-gray-400 mt-4">
                  <p class="mt-3 text-sm text-gray-500">${formattedDate}</p>
              </div>
          </div>
      </div>
    `;

    container.innerHTML += itemNews;
  });
}

function getNewsEmptyStateConfig() {
  if (matchesPath("/newsList", "/newsList.html")) {
    return {
      eyebrow: "Arsip Berita Belum Tersedia",
      title: "Belum ada berita yang bisa ditampilkan saat ini",
      description:
        "Data berita dari SHIBA belum masuk atau masih disinkronkan. Coba buka lagi beberapa saat, atau lanjut lihat data gempa terbaru yang tetap tersedia.",
      actionHref: "/",
      actionLabel: "Lihat Gempa Terkini",
    };
  }

  return {
    eyebrow: "Berita Sedang Disiapkan",
    title: "Update berita terbaru belum tersedia dulu",
    description:
      "Bagian ini akan terisi otomatis setelah sinkronisasi berita selesai. Sementara itu, kamu masih bisa melihat data gempa dan riwayat kejadian terbaru.",
    actionHref: "/earthquakeMonthly.html",
    actionLabel: "Buka Riwayat Gempa",
  };
}

function renderNewsEmptyState(container) {
  if (!container) {
    return;
  }

  const emptyState = getNewsEmptyStateConfig();

  container.innerHTML = `
    <div class="w-full sm:col-span-2 lg:col-span-3">
      <div class="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-8 shadow-lg shadow-slate-200/70 md:p-10">
        <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-shiba/10 blur-2xl"></div>
        <div class="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-shibaA/10 blur-2xl"></div>
        <div class="relative mx-auto max-w-2xl text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-slate-200">
            <svg class="h-8 w-8 text-shiba" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 7.5h14M5 12h9M5 16.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M19 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.35"/>
            </svg>
          </div>
          <p class="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-shiba">
            ${emptyState.eyebrow}
          </p>
          <h3 class="mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl">
            ${emptyState.title}
          </h3>
          <p class="mt-4 text-base leading-7 text-slate-600">
            ${emptyState.description}
          </p>
          <div class="mt-8 flex justify-center">
            <a href="${emptyState.actionHref}" class="rounded-full bg-bluebutton px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
              ${emptyState.actionLabel}
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderNewsSection(selector, newsPromise, maxItems, options = {}) {
  return newsPromise.then((data) => {
    const container = document.querySelector(selector);
    const moreLink = options.moreSelector
      ? document.querySelector(options.moreSelector)
      : null;
    const items = getPrimaryArray(data);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (moreLink) {
      moreLink.classList.add("hidden");
    }

    if (items.length === 0) {
      renderNewsEmptyState(container);
      return;
    }

    appendNewsCards(container, items, maxItems);

    if (moreLink) {
      moreLink.classList.remove("hidden");
    }
  });
}

window.openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
  }
};

window.closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
  }
};

const isLocalDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

if ("serviceWorker" in navigator && !isLocalDevelopment) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => {
        // Service worker registered.
      })
      .catch(() => {
        // Service worker registration failed.
      });
  });
}

queueMicrotask(() => {
  if (!pageLoaderHandled) {
    dismissStartupLoader();
  }
});

// HOMEPAGE
if (matchesPath("/")) {
  showPageLoader();

  const dailyShowPromise = getDailyBmkg().then((data) => {
    if (!data?.Infogempa?.gempa) {
      return;
    }

    const getContainer = document.querySelector(".image-map");

    if (getContainer && data.Infogempa.gempa.Shakemap) {
      const image = `
      <img src="https://data.bmkg.go.id/DataMKG/TEWS/${data.Infogempa.gempa.Shakemap}" alt="shakemap" class="w-full h-full object-cover">
      `;
      getContainer.innerHTML += image;
    }

    const getC = document.querySelector(".information-daily");

    if (getC) {
      const showInformation = `
      <p>
        Pada Tanggal ${data.Infogempa.gempa.Tanggal} pukul ${data.Infogempa.gempa.Jam}, Terjadi gempa bumi
        di wilayah ${data.Infogempa.gempa.Wilayah}. Gempa tersebut memiliki kekuatan Magnitudo ${data.Infogempa.gempa.Magnitude} dengan kedalaman ${data.Infogempa.gempa.Kedalaman}
      </p>
      `;
      getC.innerHTML += showInformation;
    }
  });

  async function renderCurrentMap() {
    const map = currentInitializeMap();
    const coordinates = await getEarthquakeData();
    if (coordinates) {
      const [lat, lon] = coordinates.split(",").map(Number);
      currentAddMarkerToMap(map, lat, lon);
    }
  }
  const currentMapPromise = renderCurrentMap();

  const dailyShibaPromise = getDailyShiba().then((data) => {
    const shibaArray = Object.values(data ?? {}).reverse();
    let cardCount = 0;

    const currentDate = new Date();
    const currentMonthName = monthNames[currentDate.getMonth()];
    const getTitle = document.querySelector(".month");

    if (getTitle) {
      getTitle.innerHTML = currentMonthName;
    }

    shibaArray.forEach((item) => {
      const cityName = getCityNameLabel(item?.Wilayah);

      if (cardCount < 4) {
        let imageUrl = "./images/darat.jpg";
        if (cityName.toUpperCase().includes("LAUT")) {
          imageUrl = "./images/laut.jpg";
        }

        const getCardGrid = document.querySelector(".monthly-grid");
        if (!getCardGrid) {
          return;
        }

        const createCard = `
              <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img class="w-full h-48 object-cover lazyload" data-src="${imageUrl}" alt="${cityName}">
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
  });

  const fiveMPromise = getFiveMBmkg().then((data) => {
    const fiveM = data?.Infogempa?.gempa;

    if (!Array.isArray(fiveM)) {
      return;
    }

    const getFiveMContainer = document.querySelector(".fiveM");
    if (!getFiveMContainer) {
      return;
    }

    let countFive = 0;

    fiveM.forEach((earth) => {
      const cityName = getCityNameLabel(earth?.Wilayah, false);

      if (countFive < 4) {
        const itemFive = `
        <div class="flex flex-col md:flex-row items-center bg-white border border-gray-200 rounded-lg shadow lg:max-w-screen-md hover:bg-gray-100">
          <img class="object-cover w-full h-52 rounded-l-lg lazyload" data-src="./images/p${countFive}.png" alt="Image">
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

  const newsPromise = renderNewsSection(".news-shiba", shibaNews(), 3, {
    moreSelector: ".news-more-link",
  });

  Promise.allSettled([
    dailyShowPromise,
    currentMapPromise,
    dailyShibaPromise,
    fiveMPromise,
    newsPromise,
  ]).finally(hidePageLoader);
}

// MONTLY EARTHQUAKE
if (matchesPath("/earthquakeMonthly", "/earthquakeMonthly.html")) {
  showPageLoader();

  const getNavbarMonth = document.querySelector(".month-month");
  const currentDate = new Date();
  const currentMonthName = monthNames[currentDate.getMonth()];
  const monthUpperCase = monthNames[currentDate.getMonth()].toUpperCase();

  if (getNavbarMonth) {
    getNavbarMonth.innerHTML = monthUpperCase;
  }

  const getTitleMonth = document.querySelector(".titleMonth");
  if (getTitleMonth) {
    getTitleMonth.innerHTML = currentMonthName;
  }

  function generateModal(earth, index) {
    return `
    <div id="modal${index}" class="fixed inset-0 z-[9999] hidden overflow-y-auto bg-slate-900/55 p-4 backdrop-blur-sm">
        <div class="flex min-h-full items-center justify-center">
            <div class="relative w-[92vw] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-7">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.25em] text-shiba">Detail Gempa</p>
                        <h3 class="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">Detail Gempa Bumi</h3>
                    </div>
                    <button onclick="closeModal('modal${index}')" class="rounded-full p-2 text-gray-400 transition hover:bg-slate-100 hover:text-gray-600">
                        <span class="text-xl">&times;</span>
                    </button>
                </div>
                <div class="grid max-h-[85vh] overflow-y-auto lg:grid-cols-[1fr_1.1fr]">
                    <div class="order-2 p-5 md:p-7 lg:order-1">
                        <ul class="list-disc space-y-2 pl-5 text-base leading-7 text-slate-700 md:pl-6">
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
                    <div class="order-1 bg-slate-100 p-4 md:p-6 lg:order-2">
                        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <img src="https://data.bmkg.go.id/DataMKG/TEWS/${earth.Shakemap}" alt="Earthquake Image" class="h-full max-h-[70vh] w-full object-contain">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
  }

  const monthlyContentPromise = getDailyShiba().then((month) => {
    const shibaArray = Object.values(month ?? {}).reverse();
    const containerContent = document.querySelector(".main-content");
    const modalContainer = document.querySelector(".modal-container");

    if (!containerContent || !modalContainer) {
      return;
    }

    shibaArray.forEach((earth, index) => {
      const cityName = getCityNameLabel(earth?.Wilayah);
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
      modalContainer.innerHTML += generateModal(earth, index);
    });

    shibaArray.forEach((earth, index) => {
      if (earth.Coordinates) {
        const [lat, lon] = earth.Coordinates.split(",").map(Number);
        const map = fiveMInitializeMap(index);
        fiveMAddMarkerToMap(map, lat, lon);
      } else {
        console.error(`Data gempa ke-${index} tidak memiliki koordinat.`);
      }
    });
  });

  const monthlyNewsPromise = renderNewsSection(".news-shiba", shibaNews(), 3, {
    moreSelector: ".news-more-link",
  });

  Promise.allSettled([monthlyContentPromise, monthlyNewsPromise]).finally(
    hidePageLoader
  );
}

if (matchesPath("/newsList", "/newsList.html")) {
  showPageLoader();
  renderNewsSection(".news-shiba", shibaNewsByMonth(), 39).finally(
    hidePageLoader
  );
}

if (matchesPath("/listHighm", "/listHighm.html")) {
  getFiveMBmkg().then((data) => {
    const tbody = document.querySelector(".tbody");
    const earthquakeList = data?.Infogempa?.gempa;

    if (!tbody || !Array.isArray(earthquakeList)) {
      return;
    }

    earthquakeList.forEach((item, index) => {
      const convert = parseInt(index, 10);
      const dataTable = `
            <tr class="bg-white border-b 0 hover:bg-gray-50 ">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap ">
                    ${convert + 1}
                </th>
                <td class="px-6 py-4">
                    ${item.Tanggal + " " + item.Jam}
                </td>
                <td class="px-6 py-4">
                    ${item.Lintang}
                </td>
                <td class="px-6 py-4">
                    ${item.Bujur}
                </td>
                <td class="px-6 py-4">
                    ${item.Magnitude}
                </td>
                <td class="px-6 py-4 text-left">
                    ${item.Kedalaman}
                </td>
                <td class="px-6 py-4 text-left">
                    ${item.Wilayah}
                </td>
            </tr>
            `;
      tbody.innerHTML += dataTable;
    });
  });
}
