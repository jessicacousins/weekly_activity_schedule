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
      li.appendChild(link);
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
