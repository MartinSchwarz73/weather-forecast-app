// App.js
import { WeatherService } from './services/WeatherService.js';
import { WeatherProcessor } from './processors/WeatherProcessor.js';
import { UIRenderer } from './ui/UIRenderer.js';
import { ChartManager } from './ui/ChartManager.js';

export class App {
  constructor() {
    this.service = new WeatherService(apiKey);
    this.processor = new WeatherProcessor();
    this.chartManager = new ChartManager();
    this.ui = new UIRenderer(forecastDiv, this.chartManager);

    this.cityInput = cityInput;
    this.suggestions = suggestions;
  }

  init() {
    this.initEvents();
    this.initGeolocation();
  }

  initEvents() {
    // input search
    this.cityInput.addEventListener("input", () => this.handleInput());

    // klik mimo suggestions
    document.addEventListener("click", e => {
      if (!e.target.closest("#city")) {
        this.suggestions.classList.remove("show");
      }
    });

    // ESC zavření modalu
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        document.getElementById("chartModal").style.display = "none";
      }
    });

    // klik na modal (zavření)
    document.getElementById("chartModal").addEventListener("click", () => {
      document.getElementById("chartModal").style.display = "none";
    });
  }

  async handleInput() {
    const value = this.cityInput.value.trim();
    this.suggestions.innerHTML = "";

    if (value.length < 2) {
      this.suggestions.classList.remove("show");
      return;
    }

    try {
      let matches = await this.service.searchCities(value);

      matches = matches.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );

      if (matches.length === 0) {
        this.suggestions.classList.remove("show");
        return;
      }

      matches.forEach(city => {
        const div = document.createElement("div");
        div.textContent = `${city.name}${city.state ? ", " + city.state : ""} (${city.country})`;
        div.className = "suggestion";

        div.addEventListener("click", () => {
          this.cityInput.value = city.name;
          this.suggestions.innerHTML = "";
          this.suggestions.classList.remove("show");
          this.loadForecast(city.name);
        });

        this.suggestions.appendChild(div);
      });

      void this.suggestions.offsetWidth;
      this.suggestions.classList.add("show");

    } catch (err) {
      console.error("Chyba při vyhledávání měst:", err);
    }
  }

  async loadForecast(city) {
    this.ui.forecastDiv.innerHTML = "";

    try {
      const data = await this.service.getForecast(city);

      if (data.cod !== "200") {
        this.ui.forecastDiv.textContent = "Nepodařilo se načíst předpověď.";
        return;
      }

      const daily = this.processor.processForecast(data);

      this.ui.renderForecast(daily);

    } catch (err) {
      this.ui.forecastDiv.textContent = "Chyba při načítání dat.";
      console.error(err);
    }
  }

  initGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const data = await this.service.reverseGeocode(lat, lon);

            if (data.length > 0) {
              this.cityInput.value = data[0].name;
              this.loadForecast(data[0].name);
            }
          } catch (err) {
            console.error("Chyba při reverse geocoding:", err);
          }
        },
        error => {
          console.error("Geolokace selhala:", error);
        }
      );
    }
  }
}


// API key for OpenWeatherMap
const apiKey = "5ba12d9a9dbe55f435bc6d84cb8431af";

// references to DOM elements
const cityInput = document.getElementById("city");
const suggestions = document.getElementById("suggestions");
const forecastDiv = document.getElementById("forecast");