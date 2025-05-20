document.addEventListener("DOMContentLoaded", () => {
  renderRecentEmployees();
  renderDayBreakdownChart();
  renderMostFrequentClients();
  renderDailyChangeLog();

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
  updateDashboardStats();
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
          pointLabels: { color: "#ccc" },
          grid: { color: "rgba(255, 252, 252, 0.93)" },
          angleLines: { color: "rgba(255, 254, 254, 0.9)" },
          ticks: {
            color: "#aaa",
            backdropColor: "transparent",
          },
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
          backgroundColor: "#0456a1",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#ccc" },
          grid: { color: "rgba(253, 250, 250, 0.88)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" },
          grid: { color: "rgba(247, 233, 233, 0.46)" },
        },
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

// stats container
function updateDashboardStats() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const employeeCount = employees.length;
  const scheduleKeys = Object.keys(localStorage).filter((k) =>
    k.startsWith("schedule_")
  );
  const clientKeys = Object.keys(localStorage).filter((k) =>
    k.startsWith("attendance_")
  );

  document.getElementById("stats-box").innerHTML = `
    <strong>Employees:</strong> ${employeeCount} |
    <strong>Schedules:</strong> ${scheduleKeys.length} |
    <strong>Attendance Logs:</strong> ${clientKeys.length}
  `;
}

function renderRecentEmployees() {
  const container = document.getElementById("recentEmployees");
  if (!container) return;
  const log = JSON.parse(localStorage.getItem("employee_log")) || [];
  const sorted = log
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  container.innerHTML = "";
  sorted.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(entry.timestamp).toLocaleString()} — ${
      entry.name
    }`;
    container.appendChild(li);
  });
}

function renderDayBreakdownChart() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayCounts = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
  };

  employees.forEach((emp) => {
    const schedule = JSON.parse(localStorage.getItem(`schedule_${emp}`)) || {};
    days.forEach((day) => {
      const blocks = schedule[day] || {};
      if (Object.values(blocks).some((val) => val && val.trim() !== "")) {
        dayCounts[day]++;
      }
    });
  });

  const ctx = document.getElementById("dayBreakdownChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [
        {
          label: "Employees Scheduled",
          data: days.map((d) => dayCounts[d]),
          backgroundColor: "#1eff008c",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    },
  });
}

function renderMostFrequentClients() {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const countMap = {};

  employees.forEach((emp) => {
    const attendance =
      JSON.parse(localStorage.getItem(`attendance_${emp}`)) || {};
    Object.values(attendance.days || {}).forEach(({ clients = [] }) => {
      clients.forEach((client) => {
        countMap[client] = (countMap[client] || 0) + 1;
      });
    });
  });

  const topClients = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const container = document.getElementById("topClientNames");
  container.innerHTML = "";
  topClients.forEach(([name, count]) => {
    const li = document.createElement("li");
    li.textContent = `${name} (${count} visits)`;
    container.appendChild(li);
  });
}

// download weekly report button
document
  .getElementById("downloadWeeklyReportBtn")
  .addEventListener("click", async () => {
    const container = document.createElement("div");
    container.style.padding = "30px";
    container.style.maxWidth = "900px";
    container.style.margin = "0 auto";
    container.style.fontFamily = "'Roboto', sans-serif";
    container.style.color = "#333";
    container.style.fontSize = "0.95em";

    const title = document.createElement("h1");
    title.textContent = "Weekly Summary Report";
    title.style.color = "#0456a1";
    title.style.fontSize = "1.5em";
    container.appendChild(title);

    const time = document.createElement("p");
    time.textContent = "Generated: " + new Date().toLocaleString();
    time.style.marginBottom = "20px";
    time.style.fontSize = "0.85em";
    container.appendChild(time);

    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let totalBlocks = 0;
    let totalClients = 0;
    let attendanceMap = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
    };
    let clientMap = {};

    employees.forEach((emp) => {
      const schedule =
        JSON.parse(localStorage.getItem("schedule_" + emp)) || {};
      const attendance =
        JSON.parse(localStorage.getItem("attendance_" + emp)) || {};

      days.forEach((day) => {
        const blocks = schedule[day] || {};
        totalBlocks += Object.values(blocks).filter(
          (val) => val && val.trim()
        ).length;

        const clients = attendance.days?.[day]?.clients || [];
        totalClients += clients.length;
        attendanceMap[day] += clients.length;

        clients.forEach((client) => {
          clientMap[client] = (clientMap[client] || 0) + 1;
        });
      });
    });

    const blocks = document.createElement("p");
    blocks.innerHTML =
      "<strong>Total Time Blocks Filled:</strong> " + totalBlocks;
    container.appendChild(blocks);

    const clients = document.createElement("p");
    clients.innerHTML = "<strong>Total Clients Seen:</strong> " + totalClients;
    container.appendChild(clients);

    const breakdown = document.createElement("ul");
    const breakdownTitle = document.createElement("li");
    breakdownTitle.innerHTML = "<strong>Clients Per Day:</strong>";
    breakdown.appendChild(breakdownTitle);

    days.forEach((day) => {
      const li = document.createElement("li");
      li.textContent = day + ": " + attendanceMap[day];
      breakdown.appendChild(li);
    });
    container.appendChild(breakdown);

    const topClients = Object.entries(clientMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topList = document.createElement("ul");
    const headingItem = document.createElement("li");
    headingItem.innerHTML = "<strong>Top Clients:</strong>";
    topList.appendChild(headingItem);

    topClients.forEach(([name, count]) => {
      const li = document.createElement("li");
      li.textContent = name + " – " + count + " visits";
      topList.appendChild(li);
    });
    container.appendChild(topList);

    const notes = document.createElement("p");
    notes.innerHTML =
      "<strong>Manager Notes:</strong> ____________________________";
    notes.style.marginTop = "30px";
    container.appendChild(notes);

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

    html2pdf(container, {
      margin: 0.5,
      filename: "Weekly_Report.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    });
  });

function renderDailyChangeLog() {
  const container = document.getElementById("dailyChangeLog");
  if (!container) return;

  const log = JSON.parse(localStorage.getItem("activity_log")) || [];
  const grouped = {};

  log.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  });

  container.innerHTML = "";
  Object.entries(grouped)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .forEach(([date, entries]) => {
      const section = document.createElement("div");
      section.className = "log-day";

      const header = document.createElement("h3");
      header.textContent = date;
      section.appendChild(header);

      entries.forEach((entry) => {
        const p = document.createElement("p");
        p.textContent = `${new Date(entry.timestamp).toLocaleTimeString()} — ${
          entry.message
        }`;
        section.appendChild(p);
      });

      container.appendChild(section);
    });
}
