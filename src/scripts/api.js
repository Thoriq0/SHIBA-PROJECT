// API ENDPOINT BMKG
const bmkgDaily = process.env.API_DAILYBMKG || process.env.API_DALYBMKG;
// const bmkgList = process.env.API_LISTBMKG;
const bmkgFiveM = process.env.API_MFIVEBMKG;

// API SHIBA
const allSource = process.env.API_ALLPARAMSHIBA;
const shibaDaily = process.env.API_DAILYSHIBA;
const shibaList = process.env.API_LISTSHIBA;
const shibaFiveM = process.env.API_MFIVESHIBA;

// NEWS SHIBA
const newShiba = process.env.API_NEWSHIBA;

function buildFirebasePath(baseUrl, relativePath = "") {
  if (!baseUrl) {
    return null;
  }

  const trimmedBaseUrl = baseUrl.trim();
  const withoutJsonSuffix = trimmedBaseUrl.replace(/\.json$/i, "");
  const normalizedPath = relativePath.replace(/^\/+|\/+$/g, "");

  return normalizedPath
    ? `${withoutJsonSuffix}/${normalizedPath}.json`
    : `${withoutJsonSuffix}.json`;
}

async function fetchJson(url, sourceName) {
  if (!url) {
    console.log(`Missing endpoint for ${sourceName}`);
    return null;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log(`Something Wrong in ${sourceName}: ${error.message}`);
    return null;
  }
}

export async function getAllParamShiba() {
  return fetchJson(allSource, "getAllParamShiba");
}

export async function getDailyShiba() {
  return fetchJson(shibaDaily, "getDailyShiba");
}

export async function getListShiba() {
  return fetchJson(shibaList, "getListShiba");
}

export async function getFiveMinuteShiba() {
  return fetchJson(shibaFiveM, "getFiveMinuteShiba");
}

// BMKG

export async function getDailyBmkg() {
  return fetchJson(bmkgDaily, "getDailyBmkg");
}

export async function getFiveMBmkg() {
  return fetchJson(bmkgFiveM, "getFiveMBmkg");
}

export async function shibaNews() {
  return fetchJson(
    buildFirebasePath(newShiba, "latest/items"),
    "shibaNews"
  );
}

export async function shibaNewsByMonth() {
  const latestData = await fetchJson(
    buildFirebasePath(newShiba, "latest"),
    "shibaNewsLatest"
  );

  const monthKey = latestData?.monthKey;

  if (!monthKey) {
    return latestData?.items ?? null;
  }

  return fetchJson(
    buildFirebasePath(newShiba, `byMonth/${monthKey}/items`),
    "shibaNewsByMonth"
  );
}

// SHOWING FOR DATA
export async function getEarthquakeData() {
  const data = await getDailyBmkg();
  return data?.Infogempa?.gempa?.Coordinates ?? null;
}
