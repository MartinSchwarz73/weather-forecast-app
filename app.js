// app.js

const apiKey = "5ba12d9a9dbe55f435bc6d84cb8431af";
const cityInput = document.getElementById("city");
const suggestions = document.getElementById("suggestions");

// dynamické vyhledávání měst přes API
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
    
    console.log("Geo API matches:", matches);

    // Filtr - jen města která začínají na napsané znaky
    matches = matches.filter(c => 
      c.name.toLowerCase().startsWith(value.toLowerCase())
    );

    if (matches.length === 0) {
      suggestions.classList.remove("show");
      return;
    }

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

// vykreslení tabulky s předpovědí

async function loadForecast(city) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = ""; // smaže starou tabulku

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city},CZ&units=metric&appid=${apiKey}`
    );
    const data = await res.json();

    if (data.cod !== "200") {
      forecastDiv.textContent = "Nepodařilo se načíst předpověď.";
      return;
    }

    // seskupení po dnech
    const daily = {};
    data.list.forEach(slot => {
      const date = slot.dt_txt.split(" ")[0];
      if (!daily[date]) {
        daily[date] = { min: slot.main.temp_min, max: slot.main.temp_max };
      } else {
        daily[date].min = Math.min(daily[date].min, slot.main.temp_min);
        daily[date].max = Math.max(daily[date].max, slot.main.temp_max);
      }
    });

    // vytvoření tabulky
    const table = document.createElement("table");
    table.style.border = "1px solid black";
    table.style.borderCollapse = "collapse";

    const header = table.insertRow();
    header.insertCell().textContent = "Den";
    header.insertCell().textContent = "Min (°C)";
    header.insertCell().textContent = "Max (°C)";

    Object.entries(daily).forEach(([date, temps]) => {
      const row = table.insertRow();
      row.insertCell().textContent = date;
      row.insertCell().textContent = temps.min.toFixed(1);
      row.insertCell().textContent = temps.max.toFixed(1);
    });

    forecastDiv.appendChild(table);
  } catch (err) {
    forecastDiv.textContent = "Chyba při načítání dat.";
    console.error(err);
  }
}
/*
function loadForecast(city) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = ""; // smaže starou tabulku

  let forecast = null;

  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => {
      console.log("API request pro město:", city);
      console.log("API status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("API data:", data);

      const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
      );

      const forecast = daily.slice(0,5).map(item => ({
        day: new Date(item.dt_txt).toLocaleDateString(),
        temp: item.main.temp
      }));
      console.log("Zpracovaná data:", forecast);
      renderForecast(forecast);

    })
    .catch(err => console.error("Chyba API:", err));
}
*/


// vykreslení tabulky s předpovědí
function renderForecast(forecast) {
  const forecastDiv = document.getElementById("forecast");
  
  if (!forecast) {
    forecastDiv.textContent = "Žádná předpověď pro toto město";
    return;
  }

  const table = document.createElement("table");
  table.style.border = "1px solid black";
  table.style.borderCollapse = "collapse";

  // hlavička tabulky
  const header = table.insertRow();
  ["Den", "Teplota (°C)"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    table.rows[0].appendChild(th);
  });

  // data
  forecast.forEach(item => {
    const row = table.insertRow();
    row.insertCell().textContent = item.day;
    row.insertCell().textContent = (Math.round(item.temp * 2) / 2).toFixed(1);
  });

  forecastDiv.appendChild(table);
}

document.addEventListener("click", e => {
  if (!e.target.closest("#city")) {
    // suggestions.style.display = "none";
    suggestions.classList.remove("show");
  }
});