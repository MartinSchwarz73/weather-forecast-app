export class ChartManager {
  constructor() {
    this.currentChart = null;
  }

  show(times, temps) {
    const ctx = document.getElementById("dayChart").getContext("2d");

    if (this.currentChart) this.currentChart.destroy();

    this.currentChart = new Chart(ctx, {
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
          legend: { display: true }
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
}