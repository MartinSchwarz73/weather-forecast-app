// app.js

let cities = [];

// načtení seznamu měst pro našeptávač
fetch("cities.json")
  .then(res => res.json())
  .then(data => { cities = data; })
  .catch(err => console.error("Chyba při načítání cities.json:", err));

// našeptávač
const cityInput = document.getElementById("city");
const suggestions = document.getElementById("suggestions");

cityInput.addEventListener("input", () => {
  const value = cityInput.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!value) {
    suggestions.classList.remove("show"); // fade-out
    return;
  }

  const matches = cities.filter(c => c.name.toLowerCase().startsWith(value));
  
  if (matches.length === 0) {
    suggestions.classList.remove("show"); // fade-out
    return;
  }

  matches.forEach(c => {
    const div = document.createElement("div");
    div.textContent = c.name;
    div.className = "suggestion";
    div.addEventListener("click", () => {
      cityInput.value = c.name;
      suggestions.innerHTML = "";
      suggestions.classList.remove("show"); // fade-out po kliknutí
      loadForecast(c.name); // vykreslí tabulku
    });
    suggestions.appendChild(div);
  });
    // force reflow aby transition proběhla i po innerHTML clear
  void suggestions.offsetWidth;

  suggestions.classList.add("show"); // fade-in

});

// vykreslení dummy tabulky předpovědi
function loadForecast(city) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = ""; // smaže starou tabulku

  // https://home.openweathermap.org/
  // key: 5ba12d9a9dbe55f435bc6d84cb8431af
    const apiKey = "5ba12d9a9dbe55f435bc6d84cb8431af";

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
    row.insertCell().textContent = item.temp;
  });

  forecastDiv.appendChild(table);
}

document.addEventListener("click", e => {
  if (!e.target.closest("#city")) {
    // suggestions.style.display = "none";
    suggestions.classList.remove("show");
  }
});