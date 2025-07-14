export function init() {

    document.getElementById("exportStampedToCSVBtn").addEventListener("click", () => {
        alert("📄 This will export the stamping report.");
    });

    renderStampingTables()


}
// Simulated session username (replace with real session later)
const currentUser = "j.molefe"; // or dynamically set this after login


let stampingInProgress = [
  { serial: "SN-1001", castCode: "CC-001", heatCode: "HT-100", product: "155mm HE" },
  { serial: "SN-1002", castCode: "CC-002", heatCode: "HT-101", product: "155mm HE" },
  { serial: "SN-1003", castCode: "CC-003", heatCode: "HT-102", product: "155mm HE" },
  { serial: "SN-1004", castCode: "CC-004", heatCode: "HT-103", product: "155mm HE" },
  { serial: "SN-1005", castCode: "CC-005", heatCode: "HT-104", product: "155mm HE" },
  { serial: "SN-1006", castCode: "CC-006", heatCode: "HT-105", product: "155mm HE" }
];

let stampedComplete = [];

function renderStampingTables() {
  const inProgressBody = document.getElementById("inProgressTableBody");
  const completeBody = document.getElementById("completeTableBody");

  // Clear current rows
  inProgressBody.innerHTML = "";
  completeBody.innerHTML = "";

  // Render In Progress
  stampingInProgress.forEach(item => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.classList.add("text-primary", "fw-bold");
    row.onclick = () => moveToComplete(item.serial);
    row.innerHTML = `
      <td>${item.serial}</td>
      <td>${item.castCode}</td>
      <td>${item.heatCode}</td>
      <td>${item.product}</td>
    `;
    inProgressBody.appendChild(row);
  });
  


  // Render Complete
  stampedComplete.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.serial}</td>
      <td>${record.castCode}</td>
      <td>${record.heatCode}</td>
      <td>${record.product}</td>
      <td>${record.user || "-"}</td>
      <td>${record.date}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning" onclick="undoStamp(${stampedComplete.indexOf(record)})">🔄 Undo</button>
      </td>
    `;
    completeBody.appendChild(row);
  });

}


function moveToComplete(serial) {
  // Find the full object by serial
  const index = stampingInProgress.findIndex(item => item.serial === serial);
  if (index === -1) return; // serial not found

  // Remove the item object from in-progress array
  const [item] = stampingInProgress.splice(index, 1);

  // Add to complete with timestamp
  stampedComplete.unshift({
    ...item, // includes serial, castCode, heatCode
    user: currentUser, // from session
    date: new Date().toLocaleString()
  });

//   filteredComplete = [...stampedComplete]; // update filtered list

  renderStampingTables();
}




export function undoStamp(index) {
  const record = stampedComplete.splice(index, 1)[0];
  stampingInProgress.unshift({
    serial: record.serial,
    castCode: record.castCode,
    heatCode: record.heatCode,
    product: record.product
  });
//   filteredComplete = [...stampedComplete];
  renderStampingTables();
}
// Expose globally so inline HTML can access it
window.undoStamp = undoStamp;


export function filterInProgress(filterText) {
  const filtered = stampingInProgress.filter(item =>
    item.serial.toLowerCase().includes(filterText.toLowerCase()) ||
    item.castCode.toLowerCase().includes(filterText.toLowerCase()) ||
    item.heatCode.toLowerCase().includes(filterText.toLowerCase())
  );

  const inProgressBody = document.getElementById("inProgressTableBody");
  inProgressBody.innerHTML = "";

  filtered.forEach(item => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.classList.add("text-primary", "fw-bold");
    row.onclick = () => moveToComplete(item.serial);
    row.innerHTML = `
      <td>${item.serial}</td>
      <td>${item.castCode}</td>
      <td>${item.heatCode}</td>
    `;
    inProgressBody.appendChild(row);
  });
}
// Expose globally so inline HTML can access it
window.filterInProgress = filterInProgress;



// Initial render
renderStampingTables();
