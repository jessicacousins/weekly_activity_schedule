document.addEventListener("DOMContentLoaded", () => {
  const dashboard = document.getElementById("dashboard");
  const employees = JSON.parse(localStorage.getItem("employees")) || [];

  employees.forEach((employee) => {
    const employeeCard = document.createElement("div");
    employeeCard.className = "employee-card";

    const nameHeader = document.createElement("h2");
    nameHeader.textContent = employee;
    employeeCard.appendChild(nameHeader);

    const scheduleData =
      JSON.parse(localStorage.getItem(`schedule_${employee}`)) || {};
    const attendanceData =
      JSON.parse(localStorage.getItem(`attendance_${employee}`)) || {};

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let totalBlocks = 0;
    let totalClients = 0;
    let attendedDays = 0;

    days.forEach((day) => {
      const blocks = scheduleData[day] || {};
      totalBlocks += Object.values(blocks).filter(
        (val) => val && val.trim() !== ""
      ).length;

      const dayAttendance = attendanceData.days?.[day]?.clients || [];
      if (dayAttendance.length > 0) {
        totalClients += dayAttendance.length;
        attendedDays++;
      }
    });

    const summarySection = document.createElement("div");
    summarySection.className = "section";
    summarySection.innerHTML = `
      <h3>Weekly Summary</h3>
      <ul style="list-style: disc; margin-left: 20px;">
        <li><strong>Time Blocks Filled:</strong> ${totalBlocks}</li>
        <li><strong>Days Attended:</strong> ${attendedDays}</li>
        <li><strong>Total Clients Seen:</strong> ${totalClients}</li>
      </ul>
    `;
    employeeCard.appendChild(summarySection);

    const scheduleSection = document.createElement("div");
    scheduleSection.className = "section";
    scheduleSection.innerHTML = `<h3>Weekly Schedule</h3>`;
    for (const [day, times] of Object.entries(scheduleData)) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day-section";
      const dayTitle = document.createElement("h4");
      dayTitle.textContent = day;
      dayDiv.appendChild(dayTitle);

      for (const [time, activity] of Object.entries(times)) {
        const item = document.createElement("p");
        item.innerHTML = `<strong>${time}:</strong> ${activity || "-"}`;
        dayDiv.appendChild(item);
      }
      scheduleSection.appendChild(dayDiv);
    }

    const attendanceSection = document.createElement("div");
    attendanceSection.className = "section";
    attendanceSection.innerHTML = `<h3>Attendance</h3>`;
    if (attendanceData.days) {
      for (const [day, details] of Object.entries(attendanceData.days)) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-section";
        const dayTitle = document.createElement("h4");
        dayTitle.textContent = `${day} (${details.date || "No date"})`;
        dayDiv.appendChild(dayTitle);

        if (details.clients && details.clients.length > 0) {
          details.clients.forEach((client) => {
            const clientItem = document.createElement("p");
            clientItem.textContent = `- ${client}`;
            dayDiv.appendChild(clientItem);
          });
        } else {
          const noClients = document.createElement("p");
          noClients.textContent = "(No clients)";
          dayDiv.appendChild(noClients);
        }

        attendanceSection.appendChild(dayDiv);
      }
    }

    employeeCard.appendChild(scheduleSection);
    employeeCard.appendChild(attendanceSection);
    dashboard.appendChild(employeeCard);
  });

  generateClientBarGraph();
  generateAttendanceHeatmap();
  generateTopClientsList();
  generateRadarChart();
  renderActivityLog();
});

// Top Clients Tracker
function generateTopClientsList() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const clientMap = {};

  employees.forEach((emp) => {
    const attendance =
      JSON.parse(localStorage.getItem(`attendance_${emp}`)) || {};
    if (attendance.days) {
      Object.values(attendance.days).forEach((entry) => {
        (entry.clients || []).forEach((client) => {
          clientMap[client] = (clientMap[client] || 0) + 1;
        });
      });
    }
  });

  const sortedClients = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const container = document.getElementById("topClientsList");
  container.innerHTML = "";
  sortedClients.forEach(([name, count]) => {
    const li = document.createElement("li");
    li.textContent = `${name} (${count} visits)`;
    container.appendChild(li);
  });
}

// Employee Utilization Radar Chart
function generateRadarChart() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const datasets = [];

  employees.forEach((employee) => {
    const scheduleData =
      JSON.parse(localStorage.getItem(`schedule_${employee}`)) || {};
    const attendanceData =
      JSON.parse(localStorage.getItem(`attendance_${employee}`)) || {};

    let blocks = 0,
      clients = 0,
      daysAttended = 0;

    days.forEach((day) => {
      const schedule = scheduleData[day] || {};
      blocks += Object.values(schedule).filter(
        (val) => val && val.trim()
      ).length;

      const attended = attendanceData.days?.[day]?.clients || [];
      if (attended.length) {
        daysAttended++;
        clients += attended.length;
      }
    });

    datasets.push({
      label: employee,
      data: [blocks, daysAttended, clients],
      fill: true,
    });
  });

  const ctx = document.getElementById("radarChart").getContext("2d");
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Blocks Filled", "Days Attended", "Clients Seen"],
      datasets,
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: 10,
        },
      },
    },
  });
}

// Recent Activity Log
function renderActivityLog() {
  const log = JSON.parse(localStorage.getItem("activity_log")) || [];
  const container = document.getElementById("activityLog");
  container.innerHTML = "";

  const sorted = log
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);

  sorted.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(entry.timestamp).toLocaleString()} — ${
      entry.message
    }`;
    container.appendChild(li);
  });
}

// Client Count Bar Graph
function generateClientBarGraph() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const totals = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
  };

  employees.forEach((emp) => {
    const attendance =
      JSON.parse(localStorage.getItem(`attendance_${emp}`)) || {};
    if (attendance.days) {
      days.forEach((day) => {
        const clients = attendance.days[day]?.clients || [];
        totals[day] += clients.length;
      });
    }
  });

  const ctx = document.getElementById("clientBarGraph").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Total Clients Attended",
          data: days.map((d) => totals[d]),
          backgroundColor: "#3498db",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Attendance Heatmap
function generateAttendanceHeatmap() {
  const heatmap = document.getElementById("attendanceHeatmap");
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
  ];
  const grid = {};

  days.forEach((d) => {
    grid[d] = {};
    times.forEach((t) => (grid[d][t] = 0));
  });

  employees.forEach((emp) => {
    const schedule = JSON.parse(localStorage.getItem(`schedule_${emp}`)) || {};
    days.forEach((day) => {
      const daily = schedule[day] || {};
      times.forEach((time) => {
        if (daily[time] && daily[time].trim() !== "") {
          grid[day][time]++;
        }
      });
    });
  });

  const headerRow = document.createElement("div");
  headerRow.className = "heatmap-row";
  headerRow.innerHTML =
    "<div class='heatmap-time'></div>" +
    days
      .map((day) => `<div class='heatmap-cell day-label'>${day}</div>`)
      .join("");
  heatmap.appendChild(headerRow);

  times.forEach((time) => {
    const row = document.createElement("div");
    row.className = "heatmap-row";
    row.innerHTML =
      `<div class='heatmap-time'>${time}</div>` +
      days
        .map((day) => {
          const count = grid[day][time];
          const intensity = Math.min(255, count * 40);
          return `<div class='heatmap-cell' style='background-color: rgb(${
            255 - intensity
          }, ${255 - intensity}, 255);'>${count}</div>`;
        })
        .join("");
    heatmap.appendChild(row);
  });
}

async function downloadDashboardPDF() {
  if (typeof html2pdf === "undefined") {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.fontSize = "12px";
  container.style.maxWidth = "1000px";
  container.style.margin = "0 auto";

  const timestamp = document.createElement("p");
  timestamp.textContent = "Report generated: " + new Date().toLocaleString();
  timestamp.style.marginBottom = "20px";
  timestamp.style.fontSize = "0.85em";
  container.appendChild(timestamp);

  const visuals = document.querySelector(".dashboard-visuals")?.cloneNode(true);
  if (visuals) container.appendChild(visuals);

  const pageBreak = document.createElement("div");
  pageBreak.style.pageBreakBefore = "always";
  container.appendChild(pageBreak);

  const dashboard = document.getElementById("dashboard")?.cloneNode(true);
  if (dashboard) container.appendChild(dashboard);

  container.classList.add("pdf-temp-container");
  document.body.appendChild(container);

  const opt = {
    margin: 0.4,
    filename: "Main_Dashboard_Report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
  };

  await html2pdf().from(container).set(opt).save();

  document.body.removeChild(container);
}
