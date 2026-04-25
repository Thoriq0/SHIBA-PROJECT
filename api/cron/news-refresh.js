const LATEST_NEWS_LIMIT = 6;
const MONTHLY_NEWS_LIMIT = 15;
const RETENTION_MONTHS = 2;
const EARTHQUAKE_PREVIOUS_MONTH_BUFFER = 4;
const BMKG_DAILY_URL =
  process.env.API_DAILYBMKG || process.env.API_DALYBMKG || null;

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload, null, 2));
}

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

function sanitizeNewsItem(item) {
  return {
    title: item?.title || "Judul tidak tersedia",
    snippet: item?.snippet || "Ringkasan berita tidak tersedia.",
    newsUrl: item?.newsUrl || "#",
    publisher: item?.publisher || "Sumber tidak tersedia",
    timestamp: item?.timestamp || `${Date.now()}`,
    images: {
      thumbnail: item?.images?.thumbnail || null,
      thumbnailProxied: item?.images?.thumbnailProxied || null,
    },
  };
}

function createNewsKey(item, index) {
  const timestamp = `${item?.timestamp || Date.now()}`;
  const slug = `${item?.title || "news-item"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${timestamp}-${slug || "item"}-${index}`;
}

function toNewsMap(items) {
  return Object.fromEntries(
    items.map((item, index) => [createNewsKey(item, index), sanitizeNewsItem(item)])
  );
}

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function getRetainedMonthKeys(date, retentionMonths) {
  const keys = [];

  for (let index = 0; index < retentionMonths; index += 1) {
    const value = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - index, 1)
    );
    keys.push(getMonthKey(value));
  }

  return keys;
}

function sanitizeEarthquakeItem(item) {
  return {
    Tanggal: item?.Tanggal || "",
    Jam: item?.Jam || "",
    DateTime: item?.DateTime || "",
    Coordinates: item?.Coordinates || "",
    Lintang: item?.Lintang || "",
    Bujur: item?.Bujur || "",
    Magnitude: item?.Magnitude || "",
    Kedalaman: item?.Kedalaman || "",
    Wilayah: item?.Wilayah || "",
    Potensi: item?.Potensi || "",
    Dirasakan: item?.Dirasakan || "",
    Shakemap: item?.Shakemap || "",
  };
}

function createEarthquakeKey(item) {
  const timestamp = `${item?.DateTime || Date.now()}`;
  return timestamp.replace(/[^0-9TZ:-]/g, "-");
}

function isSameMonth(dateString, referenceDate) {
  const currentDate = new Date(dateString);

  if (Number.isNaN(currentDate.getTime())) {
    return false;
  }

  return (
    currentDate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    currentDate.getUTCMonth() === referenceDate.getUTCMonth()
  );
}

function getPreviousMonthDate(referenceDate) {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1)
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Request to ${url} failed with ${response.status}: ${responseText}`);
  }

  return response.status === 204 ? null : response.json();
}

async function fetchLatestNews() {
  const response = await fetch(process.env.API_NEWS, {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.NEWS_KEY,
      "x-rapidapi-host": "google-news13.p.rapidapi.com",
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `RapidAPI request failed with ${response.status}: ${responseText}`
    );
  }

  const payload = await response.json();
  const items = payload?.items;

  if (!Array.isArray(items)) {
    throw new Error("RapidAPI payload does not contain an items array");
  }

  return items;
}

async function fetchLatestEarthquake() {
  const response = await fetch(BMKG_DAILY_URL);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `BMKG request failed with ${response.status}: ${responseText}`
    );
  }

  const payload = await response.json();
  const latestEarthquake = payload?.Infogempa?.gempa;

  if (!latestEarthquake?.DateTime) {
    throw new Error("BMKG payload does not contain a valid latest earthquake");
  }

  return latestEarthquake;
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { ok: false, error: "Method Not Allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorizationHeader = request.headers.authorization;

  if (!cronSecret) {
    return sendJson(response, 500, {
      ok: false,
      error: "Missing CRON_SECRET environment variable",
    });
  }

  if (authorizationHeader !== `Bearer ${cronSecret}`) {
    return sendJson(response, 401, { ok: false, error: "Unauthorized" });
  }

  if (
    !process.env.API_NEWS ||
    !process.env.NEWS_KEY ||
    !process.env.API_NEWSHIBA ||
    !BMKG_DAILY_URL ||
    !process.env.API_DAILYSHIBA
  ) {
    return sendJson(response, 500, {
      ok: false,
      error: "Missing one or more required environment variables",
    });
  }

  try {
    const now = new Date();
    const monthKey = getMonthKey(now);
    const retainedMonthKeys = getRetainedMonthKeys(now, RETENTION_MONTHS);
    const newsItems = await fetchLatestNews();
    const latestEarthquake = await fetchLatestEarthquake();
    const latestItems = newsItems.slice(0, LATEST_NEWS_LIMIT);
    const monthlyItems = newsItems.slice(0, MONTHLY_NEWS_LIMIT);
    const latestMap = toNewsMap(latestItems);
    const monthlyMap = toNewsMap(monthlyItems);
    const refreshedAt = now.toISOString();
    const currentEarthquakeMonth = new Date(latestEarthquake.DateTime);
    const previousEarthquakeMonth = getPreviousMonthDate(currentEarthquakeMonth);

    await fetchJson(buildFirebasePath(process.env.API_NEWSHIBA, "latest"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthKey,
        refreshedAt,
        itemCount: latestItems.length,
        items: latestMap,
      }),
    });

    await fetchJson(buildFirebasePath(process.env.API_NEWSHIBA, `byMonth/${monthKey}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthKey,
        refreshedAt,
        itemCount: monthlyItems.length,
        items: monthlyMap,
      }),
    });

    const existingByMonth =
      (await fetchJson(buildFirebasePath(process.env.API_NEWSHIBA, "byMonth"))) || {};
    const deletedMonths = [];

    for (const existingMonthKey of Object.keys(existingByMonth)) {
      if (!retainedMonthKeys.includes(existingMonthKey)) {
        await fetchJson(
          buildFirebasePath(process.env.API_NEWSHIBA, `byMonth/${existingMonthKey}`),
          { method: "DELETE" }
        );
        deletedMonths.push(existingMonthKey);
      }
    }

    const existingEarthquakeData = (await fetchJson(process.env.API_DAILYSHIBA)) || {};
    const sortedEarthquakeEntries = Object.entries(existingEarthquakeData).sort(
      (firstItem, secondItem) =>
        new Date(firstItem[1]?.DateTime).getTime() -
        new Date(secondItem[1]?.DateTime).getTime()
    );
    const currentMonthEarthquakes = sortedEarthquakeEntries
      .filter(([, item]) => isSameMonth(item?.DateTime, currentEarthquakeMonth))
      .map(([key, item]) => [key, sanitizeEarthquakeItem(item)]);
    const previousMonthEarthquakes = sortedEarthquakeEntries
      .filter(([, item]) => isSameMonth(item?.DateTime, previousEarthquakeMonth))
      .slice(-EARTHQUAKE_PREVIOUS_MONTH_BUFFER)
      .map(([key, item]) => [key, sanitizeEarthquakeItem(item)]);

    const latestEarthquakeKey = createEarthquakeKey(latestEarthquake);
    const latestEarthquakeExists = currentMonthEarthquakes.some(
      ([, item]) => item?.DateTime === latestEarthquake.DateTime
    );

    const earthquakeMap = Object.fromEntries([
      ...previousMonthEarthquakes,
      ...currentMonthEarthquakes,
    ]);

    if (!latestEarthquakeExists) {
      earthquakeMap[latestEarthquakeKey] = sanitizeEarthquakeItem(latestEarthquake);
    }

    await fetchJson(process.env.API_DAILYSHIBA, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(earthquakeMap),
    });

    return sendJson(response, 200, {
      ok: true,
      refreshedAt,
      monthKey,
      keptMonths: retainedMonthKeys,
      deletedMonths,
      latestCount: latestItems.length,
      monthlyCount: monthlyItems.length,
      earthquakeMonth: getMonthKey(currentEarthquakeMonth),
      earthquakePreviousMonthBuffer: previousMonthEarthquakes.length,
      earthquakeCount: Object.keys(earthquakeMap).length,
      earthquakeUpdated: !latestEarthquakeExists,
    });
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: error.message,
    });
  }
};
