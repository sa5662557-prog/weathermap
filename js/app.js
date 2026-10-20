
// Default view: Khartoum, Sudan
const DEFAULT_COORDS = [15.5007, 32.5599];
const DEFAULT_ZOOM = 6;
// Create the map inside <div id="map">
const map = L.map("map").setView(DEFAULT_COORDS, DEFAULT_ZOOM);
// Add the map tiles (the actual map images)
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
const searchForm = document.getElementById("search-form");
const locationInput = document.getElementById("location-input");
const alertBox = document.getElementById("alert-box");
const searchBtn = document.getElementById("search-btn");
const loader = document.getElementById("loader");
let currentMarker = null;
function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.classList.add("hidden");
}
function setLoading(isLoading) {
  loader.classList.toggle("hidden", !isLoading);
  searchBtn.disabled = isLoading;
}

async function safeFetch(url) {
  try {
    return await fetch(url);
  } catch {
    throw new Error("Network problem. Check your internet connection and try again.");
  }
}

async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=en&q=${encodeURIComponent(place)}`;

    const response = await safeFetch(url);

  if (!response.ok) {
    throw new Error("The location service is not responding right now. Please try again.");
  }

  const results = await response.json();

  if (results.length === 0) {
    throw new Error(`We couldn't find "${place}". Check the spelling and try again.`);
  }

  const cityTypes = ["city", "town", "village"];
  const best = results.find((result) => cityTypes.includes(result.addresstype)) || results[0];

  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    name: best.name || place,
    displayName: best.display_name
  };
}
async function getWeather(lat, lng) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric`;

    const response = await safeFetch(url);

  if (response.status === 401) {
    throw new Error("The weather service key is not active yet. Please try again later.");
  }

  if (response.status === 404) {
    throw new Error("No weather data was found for this place.");
  }

  if (response.status === 429) {
    throw new Error("Too many requests. Please wait a minute and try again.");
  }

  if (!response.ok) {
    throw new Error("We couldn't get the weather right now. Please try again.");
  }

  const data = await response.json();

  return {
    city: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6),
    clouds: data.clouds.all,
    description: data.weather[0].description,
    icon: data.weather[0].icon
  };
}
function moveMapTo(lat, lng) {
  if (currentMarker) {
    map.removeLayer(currentMarker);
  }

  map.flyTo([lat, lng], 10, { duration: 1.5 });

  currentMarker = L.marker([lat, lng]).addTo(map);
}
function buildPopupContent(location, weather) {
  const card = document.createElement("div");
  card.className = "weather-card";

  card.innerHTML = `
    <h2 class="weather-city"></h2>
    <div class="weather-main">
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
      <span class="weather-temp">${weather.temp}°C</span>
    </div>
    <p class="weather-desc">${weather.description}</p>
    <ul class="weather-details">
      <li><span>Feels like</span> <strong>${weather.feelsLike}°C</strong></li>
      <li><span>Humidity</span> <strong>${weather.humidity}%</strong></li>
      <li><span>Wind</span> <strong>${weather.windSpeed} km/h</strong></li>
      <li><span>Clouds</span> <strong>${weather.clouds}%</strong></li>
    </ul>
    <button type="button" class="share-btn">Share</button>
  `;

  const cityTitle = weather.country ? `${location.name}, ${weather.country}` : location.name;
  card.querySelector(".weather-city").textContent = cityTitle;

  const shareBtn = card.querySelector(".share-btn");
  shareBtn.addEventListener("click", () => shareWeather(location, weather, shareBtn));

  return card;
}

async function shareWeather(location, weather, button) {
  const message = `Weather in ${location.name}: ${weather.temp}°C, ${weather.description}. Humidity ${weather.humidity}%, wind ${weather.windSpeed} km/h.`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "WeatherMap", text: message, url: window.location.href });
    } catch (error) {
      if (error.name !== "AbortError") {
        showAlert("Sharing didn't work. Please try again.");
      }
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(`${message}\n${window.location.href}`);
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Share";
    }, 2000);
  } catch (error) {
    showAlert("Couldn't copy the weather. Please try again.");
  }
}

function openWeatherPopup(location, weather) {
  const content = buildPopupContent(location, weather);

  currentMarker.bindPopup(content, {
    className: "weather-popup",
    maxWidth: 280
  });

  map.once("moveend", () => currentMarker.openPopup());
}
async function handleSearch(event) {
  event.preventDefault();
  hideAlert();

  const place = locationInput.value.trim();

  if (place === "") {
    showAlert("Please type a city, address or landmark first.");
    return;
  }

  setLoading(true);

  try {
    const location = await getCoordinates(place);
    const weather = await getWeather(location.lat, location.lng);
    moveMapTo(location.lat, location.lng);
    openWeatherPopup(location, weather);
  } catch (error) {
    showAlert(error.message);
  } finally {
    setLoading(false);
  }
}

searchForm.addEventListener("submit", handleSearch);
locationInput.addEventListener("input", hideAlert);