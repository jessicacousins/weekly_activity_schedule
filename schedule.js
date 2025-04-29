const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const scheduleTimes = [
  { time: "9:00 AM", label: "Morning Meeting", fixed: true },
  { time: "10:00 AM", label: "", fixed: false },
  { time: "11:00 AM", label: "", fixed: false },
  { time: "12:00 PM", label: "Lunch", fixed: true },
  { time: "1:00 PM", label: "", fixed: false },
  { time: "2:00 PM", label: "", fixed: false },
  { time: "3:00 PM", label: "Transportation", fixed: true },
];

function getEmployeeNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || "";
}

const currentEmployee = getEmployeeNameFromURL();

const scheduleContainer = document.getElementById("schedule");
let currentEditableElement = null;

days.forEach((day) => {
  const dayCard = document.createElement("div");
  dayCard.className = "day-card";

  const dayTitle = document.createElement("h2");
  dayTitle.textContent = day;
  dayCard.appendChild(dayTitle);

  scheduleTimes.forEach((block) => {
    const timeBlock = document.createElement("div");
    timeBlock.className = "time-block";

    const timeLabel = document.createElement("span");
    timeLabel.className = "time-label";
    timeLabel.textContent = block.time;
    timeLabel.addEventListener("dblclick", () => openModal(timeLabel));

    timeBlock.appendChild(timeLabel);

    if (block.fixed) {
      const fixedText = document.createElement("div");
      fixedText.className = "fixed-times";
      fixedText.textContent = block.label;
      fixedText.addEventListener("dblclick", () => openModal(fixedText));
      timeBlock.appendChild(fixedText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.placeholder = "Enter activity...";
      textarea.value = getSavedSchedule(currentEmployee, day, block.time); // ⬅ Load value
      textarea.addEventListener("input", () => {
        saveSchedule(currentEmployee, day, block.time, textarea.value); // ⬅ Save value
      });
      timeBlock.appendChild(textarea);
    }

    dayCard.appendChild(timeBlock);
  });

  createDayOptions(dayCard, day);
  scheduleContainer.appendChild(dayCard);
});

function getSavedSchedule(employee, day, time) {
  const data = JSON.parse(localStorage.getItem(`schedule_${employee}`)) || {};
  return data[day]?.[time] || "";
}

function saveSchedule(employee, day, time, value) {
  const key = `schedule_${employee}`;
  const data = JSON.parse(localStorage.getItem(key)) || {};
  if (!data[day]) data[day] = {};
  data[day][time] = value;
  localStorage.setItem(key, JSON.stringify(data));
}

function openModal(element) {
  currentEditableElement = element;
  document.getElementById("editInput").value = element.textContent;
  document.getElementById("modalOverlay").style.display = "flex";
  setTimeout(() => {
    document.getElementById("editInput").focus();
  }, 100);
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  currentEditableElement = null;
}

function saveModal() {
  const newValue = document.getElementById("editInput").value.trim();
  if (currentEditableElement && newValue !== "") {
    currentEditableElement.textContent = newValue;
  }
  closeModal();
}

async function downloadPDF() {
  const schedule = document.getElementById("schedule");
  const attendance = document.getElementById("attendance-section");

  const scheduleClone = schedule.cloneNode(true);
  const attendanceClone = attendance.cloneNode(true);

  // Hide all elements with 'hide-in-pdf' class inside both clones
  scheduleClone.querySelectorAll(".hide-in-pdf").forEach((el) => {
    el.style.display = "none";
  });
  attendanceClone.querySelectorAll(".hide-in-pdf").forEach((el) => {
    el.style.display = "none";
  });

  // Apply PDF layout tweaks
  attendanceClone.querySelector(".attendance-grid").classList.add("pdf-mode");

  scheduleClone.style.display = "grid";
  scheduleClone.style.gridTemplateColumns = "repeat(5, 1fr)";
  scheduleClone.style.gap = "20px";
  scheduleClone.style.maxWidth = "1400px";
  scheduleClone.style.margin = "0 auto";

  attendanceClone.style.marginTop = "50px";
  attendanceClone.style.width = "100%";

  const container = document.createElement("div");
  container.appendChild(scheduleClone);

  const pageBreak = document.createElement("div");
  pageBreak.style.pageBreakBefore = "always";
  container.appendChild(pageBreak);

  container.appendChild(attendanceClone);

  document.body.appendChild(container);

  const opt = {
    margin: 0.5,
    filename: "Weekly_Schedule.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
  };

  await html2pdf().from(container).set(opt).save();

  document.body.removeChild(container);
}

// Attendance Section
const attendanceDaysContainer = document.getElementById("attendance-days");
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
let attendanceData = { employeeName: "", days: {} };

daysOfWeek.forEach((day) => {
  attendanceData.days[day] = { date: "", clients: [] };

  const dayBlock = document.createElement("div");

  dayBlock.className = "attendance-card";
  dayBlock.innerHTML = `
    <h3>${day}</h3>
    <label for="${day}-date" style="font-weight: bold;">Date:</label>
    <input type="date" id="${day}-date" style="width: 100%; padding: 8px; margin-top:5px; margin-bottom:10px;">
    
    <div class="hide-in-pdf" style="display: flex; gap: 10px; margin-top: 5px;">
      <input type="text" id="${day}-clientName" placeholder="Enter client name" style="flex: 1; padding: 8px;">
      <button data-tooltip="Add client" onclick="addClient('${day}')" style="padding: 8px 12px; background-color: #3498db; border: none; color: white; border-radius: 4px; cursor: pointer;">Add</button>
    </div>

    <ul id="${day}-clientList" style="list-style: none; padding: 0; margin-top: 15px;"></ul>
  `;

  attendanceDaysContainer.appendChild(dayBlock);
});

function addClient(day) {
  const clientInput = document.getElementById(`${day}-clientName`);
  const clientList = document.getElementById(`${day}-clientList`);
  const name = clientInput.value.trim();
  if (name === "") return;

  const li = document.createElement("li");
  li.style.marginBottom = "10px";
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.background = "#ecf0f1";
  li.style.padding = "8px";
  li.style.borderRadius = "4px";

  const clientNameSpan = document.createElement("span");
  clientNameSpan.textContent = name;
  li.appendChild(clientNameSpan);

  const removeWrapper = document.createElement("div");
  removeWrapper.className = "hide-in-pdf";

  removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.setAttribute("data-tooltip", "Remove client");
  removeBtn.style.backgroundColor = "#e74c3c";
  removeBtn.style.color = "white";
  removeBtn.style.border = "none";
  removeBtn.style.padding = "5px 10px";
  removeBtn.style.borderRadius = "4px";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.marginLeft = "10px";
  removeBtn.onclick = function () {
    li.remove();
    saveAttendanceData();
  };

  removeWrapper.appendChild(removeBtn);
  li.appendChild(removeWrapper);

  clientList.appendChild(li);
  clientInput.value = "";

  saveAttendanceData();
}

function saveAttendanceData() {
  attendanceData.employeeName = currentEmployee;
  daysOfWeek.forEach((day) => {
    attendanceData.days[day].date = document.getElementById(
      `${day}-date`
    ).value;
    attendanceData.days[day].clients = Array.from(
      document.querySelectorAll(`#${day}-clientList li span`)
    ).map((span) => span.textContent.trim());
  });
  localStorage.setItem(
    `attendance_${currentEmployee}`,
    JSON.stringify(attendanceData)
  );
}

function loadAttendanceData() {
  const data = JSON.parse(
    localStorage.getItem(`attendance_${currentEmployee}`)
  );
  if (data) {
    attendanceData = data;
    daysOfWeek.forEach((day) => {
      document.getElementById(`${day}-date`).value = data.days[day]?.date || "";
      const clientList = document.getElementById(`${day}-clientList`);
      clientList.innerHTML = "";
      (data.days[day]?.clients || []).forEach((name) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${name}</span>
          <div class="hide-in-pdf">
            <button data-tooltip="Remove client" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              Remove
            </button>
          </div>
        `;
        li.querySelector("button").onclick = () => {
          li.remove();
          saveAttendanceData();
        };
        clientList.appendChild(li);
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceData();
  document
    .getElementById("employeeName")
    .addEventListener("input", saveAttendanceData);
  daysOfWeek.forEach((day) => {
    document
      .getElementById(`${day}-date`)
      .addEventListener("change", saveAttendanceData);
  });
});

function createDayOptions(dayCard, dayName) {
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "⚙️ Options";
  toggleBtn.classList.add("small-option-btn", "hide-in-pdf");

  toggleBtn.style.marginTop = "10px";

  const optionsMenu = document.createElement("div");
  optionsMenu.className = "options-menu hide-in-pdf";
  optionsMenu.style.display = "none";
  optionsMenu.style.flexDirection = "column";
  optionsMenu.style.gap = "8px";
  optionsMenu.style.marginTop = "8px";

  const holidayBtn = document.createElement("button");
  holidayBtn.textContent = "Mark as Holiday";
  holidayBtn.className = "small-option-btn";
  holidayBtn.onclick = () => {
    markDay(dayCard, "Holiday");
    optionsMenu.style.display = "none";
  };

  const weatherBtn = document.createElement("button");
  weatherBtn.textContent = "Mark as Weather Closure";
  weatherBtn.className = "small-option-btn";
  weatherBtn.onclick = () => {
    markDay(dayCard, "Weather Closure");
    optionsMenu.style.display = "none";
  };

  const offBtn = document.createElement("button");
  offBtn.textContent = "Mark as Employee Off";
  offBtn.className = "small-option-btn";
  offBtn.onclick = () => {
    markEmployeeOff(dayCard, dayName);
    optionsMenu.style.display = "none";
  };

  const addTimeBtn = document.createElement("button");
  addTimeBtn.textContent = "Add Time Block";
  addTimeBtn.className = "small-option-btn";
  addTimeBtn.onclick = () => {
    addTimeBlock(dayCard);
    optionsMenu.style.display = "none";
  };

  optionsMenu.appendChild(holidayBtn);
  optionsMenu.appendChild(weatherBtn);
  optionsMenu.appendChild(offBtn);
  optionsMenu.appendChild(addTimeBtn);

  toggleBtn.onclick = () => {
    optionsMenu.style.display =
      optionsMenu.style.display === "none" ? "flex" : "none";
  };

  dayCard.appendChild(toggleBtn);
  dayCard.appendChild(optionsMenu);
}

function markDay(dayCard, type) {
  dayCard.querySelectorAll(".time-block").forEach((block) => block.remove());
  const notice = document.createElement("div");
  notice.textContent = `📌 ${type}`;
  notice.style.fontSize = "1.1em";
  notice.style.fontWeight = "bold";
  notice.style.textAlign = "center";
  notice.style.color = "#e74c3c";
  notice.style.marginTop = "20px";
  dayCard.appendChild(notice);
}

function markEmployeeOff(dayCard, dayName) {
  dayCard.querySelectorAll(".time-block").forEach((block) => block.remove());

  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "20px";
  wrapper.style.textAlign = "center";

  const notice = document.createElement("div");
  notice.textContent = `📌 Employee Off`;
  notice.style.fontSize = "1.1em";
  notice.style.fontWeight = "bold";
  notice.style.color = "#e67e22";
  wrapper.appendChild(notice);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Relief Staff Name";
  input.style.marginTop = "10px";
  input.style.padding = "8px";
  input.style.borderRadius = "6px";
  input.style.border = "1px solid #ccc";
  input.style.width = "80%";
  wrapper.appendChild(input);

  dayCard.appendChild(wrapper);
}

function addTimeBlock(dayCard) {
  const timeBlock = document.createElement("div");
  timeBlock.className = "time-block";

  const timeLabel = document.createElement("span");
  timeLabel.className = "time-label";
  timeLabel.textContent = "New Time";
  timeLabel.addEventListener("dblclick", () => openModal(timeLabel));

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter new activity...";

  timeBlock.appendChild(timeLabel);
  timeBlock.appendChild(textarea);

  const options = dayCard.querySelector('div[style*="flex-direction: column"]');
  dayCard.insertBefore(timeBlock, options);
}

document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceData();
  const employeeInput = document.getElementById("employeeName");
  employeeInput.value = getEmployeeNameFromURL();

  employeeInput.addEventListener("input", saveAttendanceData);
  daysOfWeek.forEach((day) => {
    document
      .getElementById(`${day}-date`)
      .addEventListener("change", saveAttendanceData);
  });
});
