export class WeatherProcessor {
  processForecast(data) {
    const daily = {};

    data.list.forEach(slot => {
      const weekday = new Date(slot.dt_txt).toLocaleDateString("cs-CZ", { weekday: "long" });
      const datePart = new Date(slot.dt_txt).toLocaleDateString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

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

    return daily;
  }
}