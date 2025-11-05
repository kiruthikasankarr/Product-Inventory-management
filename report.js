document.addEventListener("DOMContentLoaded", () => {
    const products = JSON.parse(localStorage.getItem("products")) || [];
  
    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
  
    const ctx = document.getElementById("reportChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: [
            "#36A2EB",
            "#FF6384",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40"
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: false }
        }
      }
    });
  
    const tbody = document.getElementById("categoryTableBody");
    tbody.innerHTML = "";
  
    if (Object.keys(categoryCounts).length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No data available</td></tr>`;
    } else {
      Object.entries(categoryCounts).forEach(([category, count]) => {
        const row = `
          <tr>
            <td>${category}</td>
            <td>${count}</td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    }
    document.getElementById("reportDate").textContent = 
    "Generated on: " + new Date().toLocaleString();
  });
  