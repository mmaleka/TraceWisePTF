
export function init() {

    document.getElementById("exportUTDataBtn").addEventListener("click", () => {
        alert("📄 This will export the MPI report.");
    });
    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });


    


    // const utRecords = []; // Your table data
    const utTableBody = document.getElementById("utTableBody");
    document.getElementById("Product").value = "155mm HE";

    

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const serial = document.getElementById("serialNumber").value;
    const castCode = document.getElementById("castCode").value;
    const heatCode = document.getElementById("heatCode").value;
    const Product = document.getElementById("Product").value;
    const sentence = document.getElementById("sentence").value;
    const comment = document.getElementById("comment").value;
    const date = new Date().toLocaleDateString();

    utRecords.unshift({ serial, castCode, heatCode, Product, sentence, comment, date });

    renderUTTable();

    document.getElementById("utMessage").textContent = `✅ Result saved for ${serial}`;
    document.getElementById("utMessage").style.color = "#28a745";
    document.getElementById("utForm").reset();

    setTimeout(closeFormPanel, 1000); // Auto-close after 1 sec
    });

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

    // Initial render
    renderUTTable();

    document.getElementById("saveChangesBtn").addEventListener("click", () => {
        // Simulate saving to backend (replace with API call later)
        console.log("Saving changes...");
        console.table(utRecords);

        alert("✅ Changes saved successfully!");
    });


}







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




export function deleteUTRecord(index) {
    const confirmDelete = confirm(`Are you sure you want to delete record for ${utRecords[index].serial}?`);
    if (confirmDelete) {
    utRecords.splice(index, 1); // Remove from array
    renderUTTable(); // Re-render table
    }
}
// Expose globally so inline HTML can access it
window.deleteUTRecord = deleteUTRecord;



const utRecords = [
    {
    serial: "UT001",
    castCode: "C123",
    heatCode: "H456",
    product: "155mm HE",
    sentence: "Pass",
    comment: "Clean scan",
    date: "2025-06-28"
    },
    {
    serial: "UT002",
    castCode: "C124",
    heatCode: "H457",
    product: "155mm HE",
    sentence: "Rework",
    comment: "Minor pitting",
    date: "2025-06-29"
    }
];


function renderUTTable() {
    const utTableBody = document.getElementById("utTableBody");
    utTableBody.innerHTML = "";

    utRecords.forEach((record, index) => {
    utTableBody.innerHTML += `
        <tr>
        <td>${record.serial}</td>
        <td>${record.castCode}</td>
        <td>${record.heatCode}</td>
        <td>${record.product}</td>
        <td>
            <select class="form-select form-select-sm sentence-dropdown" data-index="${index}">
            <option value="Pass" ${record.sentence === "Pass" ? "selected" : ""}>✅ Pass</option>
            <option value="Rework" ${record.sentence === "Rework" ? "selected" : ""}>🔧 Rework</option>
            <option value="Scrap" ${record.sentence === "Scrap" ? "selected" : ""}>❌ Scrap</option>
            </select>
        </td>
        <td>
            <input 
            type="text" 
            class="form-control form-control-sm comment-input" 
            data-index="${index}" 
            value="${record.comment || ''}" />
        </td>
        <td>${record.date}</td>
        <td>
            <button class="btn btn-sm btn-danger" onclick="deleteUTRecord(${index})">🗑️</button>
        </td>
        </tr>
        `;
    });

    // Add change event listener to each dropdown
    document.querySelectorAll(".sentence-dropdown").forEach(select => {
    select.addEventListener("change", (e) => {
        const idx = e.target.dataset.index;
        const newSentence = e.target.value;
        utRecords[idx].sentence = newSentence;

        console.log(`Sentence updated for ${utRecords[idx].serial}: ${newSentence}`);
    });
    });

    // Comment input listener
    document.querySelectorAll(".comment-input").forEach(input => {
    input.addEventListener("input", (e) => {
        const idx = e.target.dataset.index;
        utRecords[idx].comment = e.target.value;
        console.log(`Comment updated for ${utRecords[idx].serial}: ${e.target.value}`);
    });
    });

}





