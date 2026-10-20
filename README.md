# WeatherMap

A single-page web app that shows live weather for any place on Earth on an interactive map.
Built with pure HTML, CSS and vanilla JavaScript for the **Advanced Web Technologies** course (Course Project 2) at Sudan University of Science and Technology.

**Live demo:** https://sa5662557-prog.github.io/weathermap/

## Features

- Search any city, address or landmark, in English or Arabic
- Smooth fly-to animation and a custom animated pin
- Weather card with temperature, feels like, humidity, wind (km/h), clouds and the official OpenWeatherMap icon
- Day and night card styles based on the current time at the searched place
- Share button using the Web Share API, with a copy-to-clipboard fallback
- Dark mode that follows the device setting and remembers the user's choice
- Loading indicator and friendly error messages (empty input, place not found, network problems, API errors 401 / 404 / 429)
- Responsive layout for desktop, tablet and phone
- The page never reloads: all requests use `fetch` with `async/await`

## Built with

- **HTML5** with semantic elements
- **CSS3**: custom properties, Flexbox, Grid, animations and media queries (no Bootstrap)
- **Vanilla JavaScript (ES6+)**: no frameworks, no jQuery
- **Leaflet.js 1.9.4** for the map

## APIs used

| API | Used for | API key |
|---|---|---|
| [Nominatim (OpenStreetMap)](https://nominatim.org/) | Converting the place name to coordinates (geocoding) | Not needed |
| [OpenWeatherMap Current Weather](https://openweathermap.org/current) | Current weather for the coordinates | Needed (free) |
| [OpenStreetMap tiles](https://www.openstreetmap.org/) | Map images | Not needed |

## How it works

1. The user submits the search form. `preventDefault()` stops the page from reloading.
2. The place name is sent to **Nominatim**, which returns its coordinates. City, town and village results are preferred over larger regions.
3. The coordinates are sent to **OpenWeatherMap** in a second, chained request.
4. The map flies to the place, the pin drops, and the weather card opens.

## Project structure

```
weathermap/
├── index.html      # Page structure
├── css/
│   └── style.css   # All styles, theme colors and dark mode
├── js/
│   ├── config.js   # OpenWeatherMap API key
│   └── app.js      # Map, search, API requests and UI logic
└── README.md
```

## Setup (run locally)

1. Clone the repository:
```bash
   git clone https://github.com/sa5662557-prog/weathermap.git
```
2. Create a free account at [openweathermap.org](https://openweathermap.org/) and copy your key from **My API keys**. New keys can take up to 2 hours to activate.
3. Open `js/config.js` and replace the key with yours:
```js
   const OWM_API_KEY = "your_api_key_here";
```
4. Open the folder in VS Code and start it with the **Live Server** extension (**Go Live**), or any local server.

## Note about the API key

This is a front-end only project, so the key in `config.js` is visible to anyone who opens the source code. It is a free key used only for this course project. In a production app, the key would be kept on a server and the weather requests would go through it.

## Author

**Samar** — Software Engineering, Sudan University of Science and Technology

Map data © OpenStreetMap contributors · Weather data © OpenWeatherMap

