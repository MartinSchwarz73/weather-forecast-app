export class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getForecast(city) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=cz&appid=${this.apiKey}`
    );
    return await res.json();
  }

  async searchCities(query) {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=50&appid=${this.apiKey}`
    );
    return await res.json();
  }

  async reverseGeocode(lat, lon) {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`
    );
    return await res.json();
  }
}