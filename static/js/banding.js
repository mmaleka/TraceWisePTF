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

    document.getElementById("Product").value = "155mm HE";

    

    // Initial render
    renderUTTable();

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", function (e) {
        e.preventDefault();

        // const imageInput = document.getElementById("bandingImage");
        // const file = imageInput.files[0];
        // const imageURL = file ? URL.createObjectURL(file) : "";

        const newRecord = {
        serial: document.getElementById("serialNumber").value,
        castCode: document.getElementById("castCode").value,
        heatCode: document.getElementById("heatCode").value,
        product: "155mm HE",
        pressure: document.getElementById("pressPressure").value,
        gap: document.getElementById("bandingGap").value,
        diameter: document.getElementById("diameter").value,
        // image: imageURL,
        user: currentUser,
        date: new Date().toLocaleString()
        };

        utRecords.unshift(newRecord);
        renderUTTable();
        this.reset();
        closeFormPanel();
    });


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
    serial: "UT001",
    castCode: "C123",
    heatCode: "H456",
    product: "155mm HE",
    pressure: 450,
    gap: 2.5,
    diameter: 154.8,
    image: "https://via.placeholder.com/60", // Simulated placeholder image
    user: currentUser,
    date: new Date().toLocaleString()
  },
  {
    serial: "UT001",
    castCode: "C123",
    heatCode: "H456",
    product: "155mm HE",
    pressure: 470,
    gap: 2.3,
    diameter: 155.0,
    image: "https://via.placeholder.com/60",
    user: currentUser,
    date: new Date().toLocaleString()
  },
  {
    serial: "UT001",
    castCode: "C123",
    heatCode: "H456",
    product: "155mm HE",
    pressure: 460,
    gap: 2.6,
    diameter: 154.9,
    image: "https://via.placeholder.com/60",
    user: currentUser,
    date: new Date().toLocaleString()
  }
];



function renderUTTable() {
  const tbody = document.getElementById("utTableBody");
  tbody.innerHTML = "";

  utRecords.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${record.serial}</td>
        <td>${record.castCode}</td>
        <td>${record.heatCode}</td>
        <td>${record.product}</td>
        <td>${record.pressure}</td>
        <td>${record.gap}</td>
        <td>${record.diameter}</td>
        <td>
            ${record.image ? `<img src="${record.image}" alt="Banding" height="40">` : "No image"}
        </td>
        <td>${record.user}</td>
        <td>${record.date}</td>
    `;
    tbody.appendChild(row);
  });
}








export function saveChanges() {
  // Simulate saving to backend (replace with API call later)
  console.log("Saving changes...");
  console.table(utRecords);

  alert("✅ Changes saved successfully!");
}
// Expose globally so inline HTML can access it
window.saveChanges = saveChanges;


export function getCurrentShift() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? "Day" : "Night";
}
// Expose globally so inline HTML can access it
window.getCurrentShift = getCurrentShift;


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
