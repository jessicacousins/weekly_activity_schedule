document.addEventListener("DOMContentLoaded", () => {
  const employeeList = document.getElementById("employeeList");
  const openEmployeeFormBtn = document.getElementById("openEmployeeFormBtn");
  const employeeFormSection = document.getElementById("employeeFormSection");
  const employeeForm = document.getElementById("employeeForm");
  const newEmployeeNameInput = document.getElementById("newEmployeeName");
  const cancelFormBtn = document.getElementById("cancelFormBtn");

  function displayEmployees(list) {
    employeeList.innerHTML = "";
    list.forEach((name) => {
      const li = document.createElement("li");

      const avatar = document.createElement("div");
      avatar.textContent = name.charAt(0).toUpperCase();
      avatar.style.width = "65px";
      avatar.style.height = "50px";
      avatar.style.borderRadius = "50%";
      avatar.style.backgroundColor = "#F39C12";
      avatar.style.color = "white";
      avatar.style.display = "flex";
      avatar.style.alignItems = "center";
      avatar.style.justifyContent = "center";
      avatar.style.fontWeight = "bold";
      avatar.style.marginRight = "15px";

      const link = document.createElement("a");
      link.href = `schedule.html?name=${encodeURIComponent(name)}`;
      link.textContent = name;
      link.style.textDecoration = "none";
      link.style.color = "#3498db";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "X";
      removeBtn.title = "Remove employee";
      removeBtn.classList.add("action-button", "cancel-button");
      removeBtn.style.marginLeft = "10px";
      removeBtn.style.padding = "6px 12px";
      removeBtn.style.fontSize = "0.85em";

      removeBtn.onclick = () => {
        if (confirm(`Remove ${name} and all related data?`)) {
          const employees = JSON.parse(localStorage.getItem("employees")) || [];
          const updatedEmployees = employees.filter((e) => e !== name);
          localStorage.setItem("employees", JSON.stringify(updatedEmployees));
          localStorage.removeItem(`schedule_${name}`);
          localStorage.removeItem(`attendance_${name}`);
          loadEmployees();
        }
      };

      const contentWrapper = document.createElement("div");
      contentWrapper.style.display = "flex";
      contentWrapper.style.justifyContent = "space-between";
      contentWrapper.style.alignItems = "center";
      contentWrapper.style.width = "100%";

      contentWrapper.appendChild(link);
      contentWrapper.appendChild(removeBtn);

      li.appendChild(avatar);
      li.appendChild(contentWrapper);

      employeeList.appendChild(li);
    });
  }

  function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    displayEmployees(employees);
  }

  document.getElementById("searchEmployees")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    const filtered = employees.filter((name) =>
      name.toLowerCase().includes(term)
    );
    displayEmployees(filtered);
  });

  openEmployeeFormBtn.addEventListener("click", () => {
    employeeFormSection.classList.remove("hidden");
    openEmployeeFormBtn.classList.add("hidden");
    newEmployeeNameInput.focus();
  });

  cancelFormBtn.addEventListener("click", () => {
    employeeFormSection.classList.add("hidden");
    openEmployeeFormBtn.classList.remove("hidden");
    newEmployeeNameInput.value = "";
  });

  employeeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = newEmployeeNameInput.value.trim();
    if (name) {
      const employees = JSON.parse(localStorage.getItem("employees")) || [];
      employees.push(name);
      localStorage.setItem("employees", JSON.stringify(employees));

      const employeeLog =
        JSON.parse(localStorage.getItem("employee_log")) || [];
      employeeLog.push({ name, timestamp: new Date().toISOString() });
      localStorage.setItem("employee_log", JSON.stringify(employeeLog));

      loadEmployees();
      employeeForm.reset();
      employeeFormSection.classList.add("hidden");
      openEmployeeFormBtn.classList.remove("hidden");
    }
  });

  loadEmployees();
});
