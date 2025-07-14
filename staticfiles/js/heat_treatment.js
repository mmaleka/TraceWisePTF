export function init() {
    document.getElementById("exportBtn").addEventListener("click", () => {
        alert("📄 This will export the batch release report.");
    });

    // Or: bind to form etc.

    const releaseForm = document.getElementById("releaseForm");
    const formMessage = document.getElementById("formMessage");

    releaseForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("product", document.getElementById("product").value);
    formData.append("castCode", document.getElementById("castCode").value);
    formData.append("heatCode", document.getElementById("heatCode").value);
    formData.append("hardShell", document.getElementById("hardShell").value);
    formData.append("softShell", document.getElementById("softShell").value);
    formData.append("quantity", document.getElementById("quantity").value);
    formData.append("certificate", document.getElementById("certificate").files[0]);

    // Simulate successful submission
    formMessage.textContent = "✅ Batch successfully released to the next operation.";
    formMessage.style.color = "#28a745";

    // To send to backend:
    /*
    fetch('/api/heat-treatment/release', {
        method: 'POST',
        body: formData,
    }).then(res => res.json())
        .then(data => {
        formMessage.textContent = "✅ Batch released.";
        }).catch(err => {
        formMessage.textContent = "❌ Error submitting form.";
        formMessage.style.color = "#e63946";
        });
    */
    });
    
    // Load table data
    loadBatchTable();


}

const sampleBatches = [
    {
        id: "BATCH-2025-001",
        product: "155mm HE Shell",
        cast: "A12B",
        heat: "H5567",
        hard: 20,
        soft: 5,
        total: 25,
        releasedBy: "Zanele M.",
        date: "2025-06-29"
    },
    {
        id: "BATCH-2025-002",
        product: "155mm Smoke Shell",
        cast: "B34D",
        heat: "H5570",
        hard: 18,
        soft: 2,
        total: 20,
        releasedBy: "Thabo P.",
        date: "2025-06-30"
    }
    ];

function loadBatchTable() {
    const tableBody = document.getElementById("batchTableBody");
    tableBody.innerHTML = "";

    sampleBatches.forEach(batch => {
        console.log("sfgdfgdfg");
        
        const row = `
        <tr>
            <td>${batch.id}</td>
            <td>${batch.product}</td>
            <td>${batch.cast}</td>
            <td>${batch.heat}</td>
            <td>${batch.hard}</td>
            <td>${batch.soft}</td>
            <td>${batch.total}</td>
            <td>${batch.releasedBy}</td>
            <td>${batch.date}</td>
        </tr>
        `;
        tableBody.innerHTML += row;
    });
}












