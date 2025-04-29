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
