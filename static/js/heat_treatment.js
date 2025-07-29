export function init() {

    document.getElementById("exportUTDataBtn").addEventListener("click", () => {
        alert("📄 This will export the heat treatment report.");
    });

    // Initial render
    loadBatchTable();

    document.querySelector("#batchTableBody").addEventListener("click", (e) => {
    if (e.target.classList.contains("update-certificate-btn")) {
        const tr = e.target.closest("tr");
        const batchId = tr.getAttribute("data-batch-id");
        document.getElementById("batchId").value = batchId;
        document.getElementById("certificateModal").style.display = "block";
    }
    });


    document.getElementById("certificateForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    const batchId = document.getElementById("batchId").value;
    const fileInput = document.getElementById("certificateFile");
    if (!fileInput.files.length) {
        alert("Please select a certificate file.");
        return;
    }

    const formData = new FormData();
    formData.append("certificate", fileInput.files[0]);

    try {
        const response = await fetch(`https://tracewiseptf.onrender.com/api/heat-treatment/release/${batchId}/`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
        });

        if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to update certificate.");
        }

        alert("Certificate updated successfully.");
        closeModal();
        loadBatchTable(); // Refresh table data
    } catch (err) {
        alert("Error: " + err.message);
    }
    });



}





function closeModal() {
  document.getElementById("certificateModal").style.display = "none";
  document.getElementById("certificateForm").reset();
}










async function loadBatchTable() {
    console.log("sddfgfd");
    
  const token = localStorage.getItem("authToken");
  const tableBody = document.getElementById("batchTableBody");
  tableBody.innerHTML = "";

  if (!token) {
    tableBody.innerHTML = "<tr><td colspan='10'>❌ Not logged in</td></tr>";
    return;
  }

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/heat-treatment/list/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    console.log("res: ", res)
    if (!res.ok) throw new Error("Failed to load batches");

    const batches = await res.json();

    if (batches.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='9'>No batches found.</td></tr>";
      return;
    }

    batches.forEach(batch => {
      const row = `
        <tr>
          <td>${batch.id}</td>
          <td>${batch.product}</td>
          <td>${batch.cast_code}</td>
          <td>${batch.heat_code}</td>
          <td>${batch.hard_shell}</td>
          <td>${batch.soft_shell}</td>
          <td>${batch.quantity}</td>
          <td>${batch.released_by || "—"}</td>
          <td>${batch.released_at}</td>
          <td><button class="btn btn-sm btn-outline-primary update-certificate-btn">Update Certificate</button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading batches:", err);
    tableBody.innerHTML = "<tr><td colspan='9'>❌ Error loading data</td></tr>";
  }
}







