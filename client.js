const urlParams = new URLSearchParams(window.location.search);
const clientName = urlParams.get("client");

document.getElementById(
  "clientNameHeader"
).textContent = `Notes for ${clientName}`;

function getStorageKey(date) {
  return `comment_${clientName}_${date}`;
}

function saveComment() {
  const date = document.getElementById("noteDate").value;
  const comment = document.getElementById("dailyComment").value.trim();
  if (!date || !comment) return alert("Please enter a valid date and comment.");
  localStorage.setItem(getStorageKey(date), comment);
  alert("Note saved!");
  renderComments();
}

function renderComments() {
  const grid = document.getElementById("commentGrid");
  grid.innerHTML = "";
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(`comment_${clientName}_`)
  );
  keys.sort();
  keys.forEach((key) => {
    const date = key.split(`${clientName}_`)[1];
    const comment = localStorage.getItem(key);
    const entry = document.createElement("div");
    entry.className = "comment-entry";
    entry.innerHTML = `<strong>${date}:</strong><p>${comment}</p>`;
    grid.appendChild(entry);
  });
}

function generatePDF() {
  const start = document.getElementById("filterStart").value;
  const end = document.getElementById("filterEnd").value;
  if (!start || !end) return alert("Please select a date range.");

  const doc = new window.jspdf.jsPDF();
  let y = 10;
  const keys = Object.keys(localStorage)
    .filter((k) => k.startsWith(`comment_${clientName}_`))
    .sort();

  doc.text(`Client Comments for ${clientName}`, 10, y);
  y += 10;

  keys.forEach((key) => {
    const date = key.split(`${clientName}_`)[1];
    if (date >= start && date <= end) {
      const text = `${date}: ${localStorage.getItem(key)}`;
      doc.text(text, 10, y);
      y += 10;
    }
  });

  doc.save(`${clientName}_notes_${start}_to_${end}.pdf`);
}

window.onload = renderComments;

async function downloadPDF() {
  const commentContainer = document.querySelector(".client-comment-container");
  if (!commentContainer) {
    alert("Comment container not found!");
    return;
  }

  const clone = commentContainer.cloneNode(true);

  clone
    .querySelectorAll("button, input, textarea")
    .forEach((el) => el.remove());

  const wrapper = document.createElement("div");
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // generate PDF
  const opt = {
    margin: 0.5,
    filename: `${clientName}_notes_${
      new Date().toISOString().split("T")[0]
    }.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  await html2pdf().from(wrapper).set(opt).save();
  document.body.removeChild(wrapper);
}
