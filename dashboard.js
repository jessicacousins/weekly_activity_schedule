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
});

// ! client bar graph
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

// ! employee attendance heatmap
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

document.addEventListener("DOMContentLoaded", () => {
  generateClientBarGraph();
  generateAttendanceHeatmap();
});
