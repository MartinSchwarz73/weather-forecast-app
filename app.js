// app.js

// API key for OpenWeatherMap
const apiKey = "5ba12d9a9dbe55f435bc6d84cb8431af";

// references to DOM elements
const cityInput = document.getElementById("city");
const suggestions = document.getElementById("suggestions");
const forecastDiv = document.getElementById("forecast");


// fetch cities from API based on user input
cityInput.addEventListener("input", async () => {
  const value = cityInput.value.trim();
  suggestions.innerHTML = "";

  if (value.length < 2) {
    suggestions.classList.remove("show");
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=10&appid=${apiKey}`
    );
    let matches = await res.json();

    // filters results by the entered prefix (case-insensitive)
    matches = matches.filter(c =>
      c.name.toLowerCase().startsWith(value.toLowerCase())
    );

    if (matches.length === 0) {
      suggestions.classList.remove("show");
      return;
    }

    // creates a div for each matching city and adds click event to select city and load forecast
    matches.forEach(city => {
      const div = document.createElement("div");
      div.textContent = `${city.name}${city.state ? ", " + city.state : ""} (${city.country})`;
      div.className = "suggestion";
      div.addEventListener("click", () => {
        cityInput.value = city.name;
        suggestions.innerHTML = "";
        suggestions.classList.remove("show");
        loadForecast(city.name);
      });
      suggestions.appendChild(div);
    });

    void suggestions.offsetWidth;
    suggestions.classList.add("show");
  } catch (err) {
    console.error("Chyba při vyhledávání měst:", err);
  }

});

/**
 * Fetches weather forecast for the selected city 
 * and processes it to get daily min and max temperatures
 * 
 * @param {string} city - selected city 
 * @returns - none
 */
async function loadForecast(city) {
  forecastDiv.innerHTML = ""; // clear previous forecast

  try {
    // fetch forecast data for the city
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=cz&appid=${apiKey}`
    );
    const data = await res.json();

    if (data.cod !== "200") {
      forecastDiv.textContent = "Nepodařilo se načíst předpověď.";
      return;
    }

    // processes the forecast data to get daily min and max temperatures
    const daily = {};
    data.list.forEach(slot => {
      const date = new Date(slot.dt_txt).toLocaleDateString("cs-CZ", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
      if (!daily[date]) {
        daily[date] = {
          min: slot.main.temp_min,
          max: slot.main.temp_max,
          icon: slot.weather[0].icon,
          description: slot.weather[0].description
        };
      } else {
        daily[date].min = Math.min(daily[date].min, slot.main.temp_min);
        daily[date].max = Math.max(daily[date].max, slot.main.temp_max);
      }
      if (slot.dt_txt.includes("12:00:00")) {
        daily[date].icon = slot.weather[0].icon;
        daily[date].description = slot.weather[0].description;
      }
    });
    // calls the function to render the forecast table
    renderForecast(daily);

  } catch (err) {
    forecastDiv.textContent = "Chyba při načítání dat.";
    console.error(err);
  }
}

/**
 * Renders the forecast data in a table format
 * 
 * @param {Object} forecast - object containing daily min and max temperatures, weather icon, description
 * in the format { "date": { min: value, max: value, icon: value, description: value }, ... }
 * @returns - none
 */
function renderForecast(forecast) {
  if (!forecast) {
    forecastDiv.textContent = "Žádná předpověď pro toto město";
    return;
  }

  // creates a table to display the forecast data
  const table = document.createElement("table");
  table.style.border = "1px solid black";
  table.style.borderCollapse = "collapse";

  // creates the header row for the table
  const header = table.insertRow();
  ["Den", "Počasí", "Min (°C)", "Max (°C)"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    table.rows[0].appendChild(th);
  });

  // creates a row for each day in the forecast and fills in the date, min, and max 
  // temperatures rounded to the nearest 0.5 degree
  Object.entries(forecast).forEach(([date, temps]) => {
    const row = table.insertRow();
    row.insertCell().textContent = date;
    const iconCell = row.insertCell();
    const iconImg = document.createElement("img");
    iconImg.src = `https://openweathermap.org/img/wn/${temps.icon}@2x.png`;
    iconImg.alt = temps.description;
    iconImg.title = temps.description;
    iconCell.appendChild(iconImg);
    row.insertCell().textContent = (Math.round(temps.min * 2) / 2).toFixed(1);
    row.insertCell().textContent = (Math.round(temps.max * 2) / 2).toFixed(1);
  });

  forecastDiv.appendChild(table);
}

// hides suggestions when clicking outside the input or suggestions
document.addEventListener("click", e => {
  if (!e.target.closest("#city")) {
    suggestions.classList.remove("show");
  }
});