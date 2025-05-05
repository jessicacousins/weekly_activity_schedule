const urlParams = new URLSearchParams(window.location.search);
const clientName = urlParams.get("client");
document.getElementById(
  "clientNameHeader"
).textContent = `Notes for ${clientName}`;

function getStorageKey(date) {
  return `comment_${clientName}_${date}`;
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d.toISOString().split("T")[0];
}

function saveComment() {
  const date = document.getElementById("noteDate").value;
  const comment = document.getElementById("dailyComment").value.trim();
  if (!date || !comment) return alert("Please enter a valid date and comment.");
  localStorage.setItem(getStorageKey(normalizeDate(date)), comment);
  alert("Note saved!");
  renderComments();
}

function renderComments() {
  const grid = document.getElementById("commentGrid");
  grid.innerHTML = "";

  const mode =
    document.querySelector('input[name="pdfMode"]:checked')?.value || "all";
  const start = normalizeDate(document.getElementById("filterStart").value);
  const end = normalizeDate(document.getElementById("filterEnd").value);

  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith(`comment_${clientName}_`))
    .sort();

  keys.forEach((key) => {
    const rawDate = key.split(`${clientName}_`)[1];
    const date = normalizeDate(rawDate);
    const comment = localStorage.getItem(key);

    const inRange = start && end && date && date >= start && date <= end;
    const visible = mode === "all" || (mode === "range" && inRange);

    if (!visible) return;

    const entry = document.createElement("div");
    entry.className = "comment-entry";
    entry.style.backgroundColor =
      mode === "range" && inRange ? "#e6f7ff" : "#f9f9f9";
    entry.innerHTML = `<strong>${date}:</strong><p>${comment}</p>`;
    grid.appendChild(entry);
  });
}

async function downloadPDF() {
  const mode =
    document.querySelector('input[name="pdfMode"]:checked')?.value || "all";
  const start = normalizeDate(document.getElementById("filterStart").value);
  const end = normalizeDate(document.getElementById("filterEnd").value);

  const allKeys = Object.keys(localStorage)
    .filter((k) => k.startsWith(`comment_${clientName}_`))
    .sort();

  const selectedKeys = allKeys.filter((key) => {
    const rawDate = key.split(`${clientName}_`)[1];
    const date = normalizeDate(rawDate);
    if (mode === "all") return true;
    return start && end && date && date >= start && date <= end;
  });

  if (selectedKeys.length === 0) {
    alert("No comments found for the selected criteria.");
    return;
  }

  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.maxWidth = "800px";
  container.style.margin = "0 auto";
  container.innerHTML = `<h2 style="text-align:center;">Client Comments for ${clientName}</h2><br>`;

  selectedKeys.forEach((key) => {
    const rawDate = key.split(`${clientName}_`)[1];
    const date = normalizeDate(rawDate);
    const comment = localStorage.getItem(key);
    const entry = document.createElement("div");
    entry.style.marginBottom = "15px";
    entry.innerHTML = `<strong>${date}:</strong><div style="white-space:pre-wrap; margin-top:4px;">${comment}</div>`;
    container.appendChild(entry);
  });

  document.body.appendChild(container);

  const opt = {
    margin: 0.5,
    filename: `Client_Comments_${clientName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  await html2pdf().from(container).set(opt).save();
  document.body.removeChild(container);
}

function showAllComments() {
  document.querySelector('input[name="pdfMode"][value="all"]').checked = true;
  document.getElementById("filterStart").value = "";
  document.getElementById("filterEnd").value = "";
  renderComments();
}

window.onload = () => {
  renderComments();
  document
    .getElementById("filterStart")
    .addEventListener("change", renderComments);
  document
    .getElementById("filterEnd")
    .addEventListener("change", renderComments);
  document
    .querySelectorAll('input[name="pdfMode"]')
    .forEach((el) => el.addEventListener("change", renderComments));
};
