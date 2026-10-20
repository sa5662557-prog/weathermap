
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
let currentMarker = null;
function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.classList.add("hidden");
}

async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=en&q=${encodeURIComponent(place)}`;

  const response = await fetch(url);

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

  const response = await fetch(url);

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
async function handleSearch(event) {
  event.preventDefault();
  hideAlert();

  const place = locationInput.value.trim();

  if (place === "") {
    showAlert("Please type a city, address or landmark first.");
    return;
  }

    try {
    const location = await getCoordinates(place);
    const weather = await getWeather(location.lat, location.lng);
    moveMapTo(location.lat, location.lng);
    console.log(location, weather);
  } catch (error) {
    showAlert(error.message);
  }
}

searchForm.addEventListener("submit", handleSearch);