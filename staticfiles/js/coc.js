export function init() {

    document.getElementById("downloadExcelBtn").addEventListener("click", () => {
        alert("📄 This will export the coc data in excel.");
    });

    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });

    // Initial render
    renderTable();

    let cocCounter = 5; // or use a timestamp-based generator

    // Handle form submission
    document.getElementById("Form").addEventListener("submit", function (e) {
    e.preventDefault();

    const generatedCofCNumber = String(cocCounter).padStart(4, '0');
    cocCounter++;


    const newRecord = {
        cocnumber: generatedCofCNumber,
        product: document.getElementById("product").value,
        comments: document.getElementById("comments").value,
        user: currentUser,
        date: new Date().toLocaleString(),
        quantity: 0,
        complete: "❌"
    };

    Records.unshift(newRecord);
    renderTable();
    this.reset();
    // closeForm();
    // closeFormPanel();
    });




}  

// Simulated session username (replace with real session later)
const currentUser = "j.molefe"; // or dynamically set this after login
let currentProduct = "M0121 Body"; // default on load


function openFormPanel() {
    document.getElementById("FormPanel").classList.add("open");

    // Optional overlay
    const overlay = document.createElement("div");
    overlay.id = "utOverlay";
    overlay.className = "ut-overlay";
    overlay.onclick = closeFormPanel;
    document.body.appendChild(overlay);
}

function closeFormPanel() {
    document.getElementById("FormPanel").classList.remove("open");

    const overlay = document.getElementById("utOverlay");
    if (overlay) overlay.remove();
}

// const utRecords = []; // Your table data
const TableBody = document.getElementById("TableBody");





// const Records = [];
const Records = [
{
cocnumber: "0001",
product: "105mm Shell",
comments: "Batch from supplier A",
user: currentUser,
date: new Date("2025-07-01T10:30:00").toLocaleString(),
quantity: 25,
complete: "✅"
},
{
cocnumber: "0002",
product: "155mm Shell",
comments: "Initial production test",
user: currentUser,
date: new Date("2025-07-03T14:45:00").toLocaleString(),
quantity: 40,
complete: "❌"
},
{
cocnumber: "0003",
product: "Mortar Tail Fin",
comments: "Full batch QC complete",
user: currentUser,
date: new Date("2025-07-05T08:20:00").toLocaleString(),
quantity: 60,
complete: "✅"
}
];




function renderTable() {
const tbody = document.getElementById("TableBody");
tbody.innerHTML = "";

Records.forEach(record => {
const row = document.createElement("tr");
row.innerHTML = `
    <td><a href="#?id=${record.cocnumber}" class="nav-card" onclick="navigateTo('coc_detail')">${record.cocnumber}</a></td>
    <td>${record.product}</td>
    <td>${record.date}</td>
    <td>${record.user}</td>
    <td>${record.quantity}</td>
    <td>${record.complete}</td>
    <td>${record.comments}</td>
`;
tbody.appendChild(row);
});
}







export function switchProduct(index, text) {
Records[index].comments = text.trim() || "-";
}
window.switchProduct = switchProduct;
