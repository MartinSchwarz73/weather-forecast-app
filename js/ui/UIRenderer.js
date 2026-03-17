export class UIRenderer {
  constructor(forecastDiv, chartManager) {
    this.forecastDiv = forecastDiv;
    this.chartManager = chartManager;
  }

  renderForecast(forecast) {
    if (!forecast) {
      this.forecastDiv.textContent = "Žádná předpověď pro toto město";
      return;
    }

    const table = document.createElement("table");
    table.style.border = "1px solid black";
    table.style.borderCollapse = "collapse";

    const days = Object.keys(forecast);
    const categories = ["Den", "Počasí", "Min (°C)", "Max (°C)"];

    categories.forEach(category => {
      const row = table.insertRow();

      const th = document.createElement("th");
      th.textContent = category;
      row.appendChild(th);

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
            this.chartManager.show(dayData.times, dayData.temps);
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

    this.forecastDiv.innerHTML = "";
    this.forecastDiv.appendChild(table);
  }
}