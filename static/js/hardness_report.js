export function init() {

    document.getElementById("downloadExcelBtn").addEventListener("click", () => {
        alert("📄 This will export the final inspection data.");
    });
    document.getElementById("saveChangesBtn").addEventListener("click", () => {
        alert("✅ Data saved successfully!");
    });
    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });


    fetchCurrentUser();
    loadProducts();
    loadHardnessRecords();



}


// Open form with prefilled persisted values
function openFormPanel() {
  document.getElementById("utFormPanel").classList.add("open");

  const overlay = document.createElement("div");
  overlay.id = "utOverlay";
  overlay.className = "ut-overlay";
  overlay.onclick = closeFormPanel;
  document.body.appendChild(overlay);

  if (lastProductId) document.getElementById("productSelect").value = lastProductId;
  if (lastCastCode) document.getElementById("castCode").value = lastCastCode;
  if (lastHeatCode) document.getElementById("heatCode").value = lastHeatCode;

  document.getElementById("serialNumber").focus();
}

function closeFormPanel() {
  document.getElementById("utFormPanel").classList.remove("open");
  const overlay = document.getElementById("utOverlay");
  if (overlay) overlay.remove();
}




let currentUser = "Unknown";
let lastProductId = "";
let lastCastCode = "";
let lastHeatCode = "";
let hardnessRecords = []; // store all loaded and new records

let filterCastCode = "";
let filterHeatCode = "";

// Fetch current user info
async function fetchCurrentUser() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      const user = await res.json();
      currentUser = user.username;
      console.log("✅ Logged in as:", currentUser);
    }
  } catch (err) {
    console.error("User fetch failed:", err);
  }
}

// Load products for dropdown
async function loadProducts() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/products/", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load products");

    const products = await res.json();
    const select = document.getElementById("productSelect");
    products.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Render table applying filters
function renderHardnessTable() {
  const tbody = document.getElementById("utTableBody");
  tbody.innerHTML = "";

  const filteredRecords = hardnessRecords.filter(record => {
    const castMatches = record.cast_code.toLowerCase().includes(filterCastCode);
    const heatMatches = record.heat_code.toLowerCase().includes(filterHeatCode);
    return castMatches && heatMatches;
  });

  filteredRecords.forEach(record => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", record.id);

    tr.innerHTML = `
      <td>${record.product_name || "Unknown"}</td>
      <td contenteditable="true" data-field="serial">${record.serial}</td>
      <td contenteditable="true" data-field="cast_code">${record.cast_code}</td>
      <td contenteditable="true" data-field="heat_code">${record.heat_code}</td>
      <td contenteditable="true" data-field="hardness_value">${record.hardness_value}</td>
      <td>${record.recorded_by || "-"}</td>
      <td>${new Date(record.date).toLocaleString()}</td>
      <td><button class="btn btn-sm btn-danger btn-delete" title="Delete record">🗑️</button></td>
    `;

    // Attach delete handler for this row's delete button
    tr.querySelector(".btn-delete").addEventListener("click", () => {
      deleteHardnessRecord(record.id);
    });

    tbody.appendChild(tr);
  });
}



// Submit new hardness entry, update table immediately
document.getElementById("utForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const token = localStorage.getItem("authToken");

  const payload = {
    product: parseInt(document.getElementById("productSelect").value),
    serial: document.getElementById("serialNumber").value,
    cast_code: document.getElementById("castCode").value,
    heat_code: document.getElementById("heatCode").value,
    hardness_value: parseFloat(document.getElementById("hardnessValue").value)
  };

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/heat-treatment/ht-components/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save hardness data");

    const saved = await res.json();

    lastProductId = payload.product;
    lastCastCode = payload.cast_code;
    lastHeatCode = payload.heat_code;

    hardnessRecords.unshift({
      id: saved.id,
      product_name: saved.product_name || "", // backend should send this or add logic to map product id to name
      serial: saved.serial,
      cast_code: saved.cast_code,
      heat_code: saved.heat_code,
      hardness_value: saved.hardness_value,
      recorded_by: currentUser,
      date: saved.date || new Date().toISOString()
    });

    renderHardnessTable();

    document.getElementById("serialNumber").value = "";
    document.getElementById("hardnessValue").value = "";
    document.getElementById("serialNumber").focus();

    alert("✅ Entry saved successfully");
  } catch (err) {
    console.error("Submit error:", err);
    alert("❌ Could not save entry");
  }
});

// Enable Enter key submission inside form
document.getElementById("utForm").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.querySelector("#utForm button[type='submit']").click();
  }
});

// Save all editable table rows back to backend
async function saveHardnessChanges() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("⚠️ Please login first.");
    return;
  }

  const rows = document.querySelectorAll("#utTableBody tr");

  for (let row of rows) {
    const id = row.getAttribute("data-id");
    if (!id) continue;

    const updated = {};
    row.querySelectorAll("[contenteditable=true]").forEach(cell => {
      const field = cell.getAttribute("data-field");
      updated[field] = cell.textContent.trim();
    });

    try {
      const res = await fetch(`https://tracewiseptf.onrender.com/api/heat-treatment/ht-components/${id}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Failed to save row", id, error);
        alert(`❌ Failed to save row ${id}`);
      }
    } catch (err) {
      console.error("❌ Error saving row", id, err);
    }
  }

  alert("✅ All changes saved");
}

// Delete record by ID
async function deleteHardnessRecord(id) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("⚠️ Please login first.");
    return;
  }

  if (!confirm("Are you sure you want to delete this record?")) return;

  try {
    const res = await fetch(`https://tracewiseptf.onrender.com/api/heat-treatment/ht-components/${id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Failed to delete record", id, error);
      alert("❌ Failed to delete record.");
      return;
    }

    // Remove from local data and re-render
    hardnessRecords = hardnessRecords.filter(r => r.id !== id);
    renderHardnessTable();

    alert("✅ Record deleted successfully.");
  } catch (err) {
    console.error("Error deleting record", id, err);
    alert("❌ Error deleting record.");
  }
}

// Load existing hardness records from backend on page load
async function loadHardnessRecords() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/heat-treatment/ht-components/", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load hardness records");

    const records = await res.json();

    hardnessRecords = records.map(r => ({
      id: r.id,
      product_name: r.product_name || r.product || "Unknown",
      serial: r.serial,
      cast_code: r.cast_code,
      heat_code: r.heat_code,
      hardness_value: r.hardness_value,
      recorded_by: r.recorded_by?.username || "-",
      date: r.date
    }));

    renderHardnessTable();
  } catch (err) {
    console.error("Error loading hardness records:", err);
  }
}

// Filter input event listeners
window.addEventListener("load", () => {
  document.getElementById("filterCastCode").addEventListener("input", (e) => {
    filterCastCode = e.target.value.trim().toLowerCase();
    renderHardnessTable();
  });

  document.getElementById("filterHeatCode").addEventListener("input", (e) => {
    filterHeatCode = e.target.value.trim().toLowerCase();
    renderHardnessTable();
  });
});

// // Initialize everything on page load
// window.onload = async function () {
//   await fetchCurrentUser();
//   await loadProducts();
//   await loadHardnessRecords();
// };
