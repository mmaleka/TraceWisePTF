export function init() {

    document.getElementById("exportUTDataBtn").addEventListener("click", () => {
        alert("📄 This will export the batch release report.");
    });
    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });

    document.getElementById("saveChangesBtn").addEventListener("click", () => {
        // Simulate saving to backend (replace with API call later)
        console.log("Saving changes...");
        console.table(utRecords);

        alert("✅ Changes saved successfully!");
    });


    
    // const utRecords = []; // Your table data
    const utTableBody = document.getElementById("utTableBody");
    document.getElementById("Product").value = "155mm HE";

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const newRecord = {
        opDesc: document.getElementById("opDesc").value,
        opNo: document.getElementById("opNo").value,
        machineNo: document.getElementById("machineNo").value,
        // product: document.getElementById("cncProduct").value,
        product: document.getElementById("Product").value,
        determination: document.getElementById("cncDetermination").value,
        comments: document.getElementById("cncComments").value || "-",
        shift: getCurrentShift(),
        user: currentUser,
        date: new Date().toLocaleString()
    };

    utRecords.unshift(newRecord);
        renderUTTable();
    this.reset();
        closeFormPanel();
    });


    // Initial render
    renderUTTable();


}


// Simulated session username (replace with real session later)
const currentUser = "j.molefe"; // or dynamically set this after login

function closeFormPanel() {
    document.getElementById("utFormPanel").classList.remove("open");

    const overlay = document.getElementById("utOverlay");
    if (overlay) overlay.remove();
}


function openFormPanel() {
    document.getElementById("utFormPanel").classList.add("open");

    // Optional overlay
    const overlay = document.createElement("div");
    overlay.id = "utOverlay";
    overlay.className = "ut-overlay";
    overlay.onclick = closeFormPanel;
    document.body.appendChild(overlay);
}

  
 
// Attach change listener to dropdowns
document.querySelectorAll(".sentence-dropdown").forEach(select => {
    select.addEventListener("change", (e) => {
        const index = e.target.dataset.index;
        const newValue = e.target.value;
        utRecords[index].sentence = newValue;

        // Optional: confirmation or toast message
        console.log(`Sentence updated for ${utRecords[index].serial}: ${newValue}`);
    });
});
   




const utRecords = [
  {
    opDesc: "Rough Bore",
    opNo: "101",
    machineNo: "M01",
    product: "155mm HE Shell",
    determination: "Pass",
    comments: "No issues observed",
    shift: getCurrentShift(),
    user: currentUser,
    date: new Date().toLocaleString()
  },
  {
    opDesc: "Fine Bore",
    opNo: "102",
    machineNo: "M02",
    product: "155mm Smoke Shell",
    determination: "Rework",
    comments: "Tool chatter detected",
    shift: getCurrentShift(),
    user: currentUser,
    date: new Date().toLocaleString()
  },
  {
    opDesc: "Groove Cutting",
    opNo: "103",
    machineNo: "M03",
    product: "155mm Base Bleed Shell",
    determination: "Scrap",
    comments: "Excess material left",
    shift: getCurrentShift(),
    user: currentUser,
    date: new Date().toLocaleString()
  }
];


function renderUTTable() {
  const tbody = document.getElementById("utTableBody");
  tbody.innerHTML = "";

  utRecords.forEach((r, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.opDesc}</td>
      <td>${r.opNo}</td>
      <td>${r.machineNo}</td>
      <td>${r.product}</td>
      <td>
        <select class="form-select form-select-sm" onchange="updateCNCDropdown(${i}, this.value)">
          <option value="Pass" ${r.determination === "Pass" ? "selected" : ""}>✅ Pass</option>
          <option value="Rework" ${r.determination === "Rework" ? "selected" : ""}>🔧 Rework</option>
          <option value="Scrap" ${r.determination === "Scrap" ? "selected" : ""}>❌ Scrap</option>
        </select>
      </td>
      
      <input 
            type="text" 
            class="form-control form-control-sm comment-input" 
            data-index="${i}" 
            value="${r.comments || ''}" />
        </td>
      <td>${r.shift}</td>
      <td>${r.user}</td>
      <td>${r.date}</td>
    `;
    tbody.appendChild(row);
  });
}

// export function updateCNCDropdown(index, value) {
//   cncRecords[index].determination = value;
// }
// // Expose globally so inline HTML can access it
// window.updateCNCDropdown = updateCNCDropdown;

// export function updateCNCComment(index, text) {
//   cncRecords[index].comments = text.trim() || "-";
// }
// // Expose globally so inline HTML can access it
// window.updateCNCComment = updateCNCComment;






export function saveChanges() {
  // Simulate saving to backend (replace with API call later)
  console.log("Saving changes...");
  console.table(utRecords);

  alert("✅ Changes saved successfully!");
}
// Expose globally so inline HTML can access it
window.updateCNCDropdown = updateCNCDropdown;

function getCurrentShift() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? "Day" : "Night";
}



export function updateCNCDropdown(index, value) {
  utRecords[index].determination = value;
}
// Expose globally so inline HTML can access it
window.updateCNCDropdown = updateCNCDropdown;

export function updateCNCComment(index, text) {
  utRecords[index].comments = text.trim() || "-";
}
// Expose globally so inline HTML can access it
window.updateCNCComment = updateCNCComment;
