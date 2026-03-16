// app.js

// API key for OpenWeatherMap
const apiKey = "5ba12d9a9dbe55f435bc6d84cb8431af";

// references to DOM elements
const cityInput = document.getElementById("city");
const suggestions = document.getElementById("suggestions");
const forecastDiv = document.getElementById("forecast");

let currentChart; // reference to the current Chart.js instance

// tries to get user's location on page load and 
// loads forecast for that location
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Reverse geocoding pomocí OpenWeatherMap
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) {
              cityInput.value = data[0].name;
              loadForecast(data[0].name); 
            }
          })
          .catch(err => console.error('Chyba při reverse geocoding:', err));
      },
      error => {
        console.error('Geolokace není podporována nebo odmítnuta:', error);
      }
    );
  } else {
    console.error('Geolokace není podporována v tomto prohlížeči.');
  }
});

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
      const weekday = new Date(slot.dt_txt).toLocaleDateString("cs-CZ", { weekday: "long" });
      const datePart = new Date(slot.dt_txt).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
      const date = `${weekday}<br>${datePart}`;
      if (!daily[date]) {
        daily[date] = {
          min: slot.main.temp_min,
          max: slot.main.temp_max,
          icon: slot.weather[0].icon,
          description: slot.weather[0].description,
          temps: [],
          times: []
        };
      } else {
        daily[date].min = Math.min(daily[date].min, slot.main.temp_min);
        daily[date].max = Math.max(daily[date].max, slot.main.temp_max);
      }

      // graf data
      daily[date].temps.push(slot.main.temp);
      daily[date].times.push(
        new Date(slot.dt_txt).toLocaleTimeString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit"
        })
      );

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

  // get array of days
  const days = Object.keys(forecast);

  // categories for the transposed table
  const categories = ["Den", "Počasí", "Min (°C)", "Max (°C)"];

  // creates a row for each category
  categories.forEach(category => {
    const row = table.insertRow();

    // first cell is the category header
    const th = document.createElement("th");
    th.textContent = category;
    row.appendChild(th);

    // then add cells for each day
    days.forEach(date => {
      const td = document.createElement("td");

      if (category === "Den") {
        td.innerHTML = date;
      } else if (category === "Počasí") {
        const iconDiv = document.createElement("div");
        iconDiv.className = "weather-icon";

        const weather = document.createElement("div");
        weather.className = "weather";
        weather.style.backgroundImage =
          `url(https://openweathermap.org/img/wn/${forecast[date].icon}@2x.png)`;

        const graph = document.createElement("div");
        graph.className = "graph";
        graph.style.backgroundImage =
          `url(/images/mini-graph-100x100px.png)`;

        iconDiv.appendChild(weather);
        iconDiv.appendChild(graph);

        iconDiv.addEventListener("click", () => {
          const dayData = forecast[date];
          if (!dayData) return;
          document.getElementById("chartModal").style.display = "flex";
          showChart(dayData.times, dayData.temps);
        });

        td.appendChild(iconDiv);
      } else if (category === "Min (°C)") {
        td.textContent = (Math.round(forecast[date].min * 2) / 2).toFixed(1);
      } else if (category === "Max (°C)") {
        td.textContent = (Math.round(forecast[date].max * 2) / 2).toFixed(1);
      }

      row.appendChild(td);
    });
  });

  forecastDiv.appendChild(table);
}

function showChart(times, temps) {
  const ctx = document.getElementById("dayChart").getContext("2d");

  // destroy previous chart instance if it exists 
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: times,
      datasets: [{
        label: "Teplota °C",
        data: temps,
        borderColor: "orange",
        backgroundColor: "rgba(255,165,0,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          suggestedMin: Math.min(...temps) - 2,
          suggestedMax: Math.max(...temps) + 2
        }
      }
    }
  });
}

// hides the chart modal when clicking outside the chart
document.getElementById("chartModal").addEventListener("click", () => {
  document.getElementById("chartModal").style.display = "none";
});

// hides the chart modal when pressing the Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("chartModal").style.display = "none";
  }
});

// hides suggestions when clicking outside the input or suggestions
document.addEventListener("click", e => {
  if (!e.target.closest("#city")) {
    suggestions.classList.remove("show");
  }
});
