document.addEventListener("DOMContentLoaded", () => {
  const employeeList = document.getElementById("employeeList");
  const openEmployeeFormBtn = document.getElementById("openEmployeeFormBtn");
  const employeeFormSection = document.getElementById("employeeFormSection");
  const employeeForm = document.getElementById("employeeForm");
  const newEmployeeNameInput = document.getElementById("newEmployeeName");
  const cancelFormBtn = document.getElementById("cancelFormBtn");
  function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem("employees")) || [];
    employeeList.innerHTML = "";

    employees.forEach((name) => {
      const li = document.createElement("li");

      const link = document.createElement("a");
      link.href = `schedule.html?name=${encodeURIComponent(name)}`;
      link.textContent = name;
      link.style.textDecoration = "none";
      link.style.color = "#3498db";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.title = "Remove employee";
      removeBtn.classList.add("action-button", "cancel-button");
      removeBtn.style.marginLeft = "10px";
      removeBtn.style.padding = "6px 12px";
      removeBtn.style.fontSize = "0.85em";
      removeBtn.onclick = () => {
        if (confirm(`Remove ${name} and all related data?`)) {
          const updatedEmployees = employees.filter((e) => e !== name);
          localStorage.setItem("employees", JSON.stringify(updatedEmployees));
          localStorage.removeItem(`schedule_${name}`);
          localStorage.removeItem(`attendance_${name}`);
          loadEmployees();
        }
      };

      li.appendChild(link);
      li.appendChild(removeBtn);
      employeeList.appendChild(li);
    });
  }

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
      loadEmployees();
      employeeForm.reset();
      employeeFormSection.classList.add("hidden");
      openEmployeeFormBtn.classList.remove("hidden");
    }
  });

  loadEmployees();
});
