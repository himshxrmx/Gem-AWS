async function loadDashboard() {

  try {
    const response = await fetch("https://h2s5lbstm7.execute-api.us-east-1.amazonaws.com/records");
    const data = await response.json();

    if (!data.length) return;

    const latest = data[data.length - 1];

    document.getElementById("total").innerText = latest.total_students;
    document.getElementById("engaged").innerText = latest.engaged;
    document.getElementById("notEngaged").innerText = latest.not_engaged;

    const ctx = document.getElementById("engagementChart").getContext("2d");

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Engaged", "Not Engaged"],
        datasets: [{
          data: [latest.engaged, latest.not_engaged],
          backgroundColor: ["#3b82f6", "#ef4444"]
        }]
      }
    });

  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

loadDashboard();

