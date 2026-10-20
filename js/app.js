
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

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.classList.add("hidden");
}

async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=${encodeURIComponent(place)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("The location service is not responding right now. Please try again.");
  }

  const results = await response.json();

  if (results.length === 0) {
    throw new Error(`We couldn't find "${place}". Check the spelling and try again.`);
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    displayName: results[0].display_name
  };
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
    console.log(location);
  } catch (error) {
    showAlert(error.message);
  }
}

searchForm.addEventListener("submit", handleSearch);