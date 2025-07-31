export function init() {

    document.getElementById("exportStampedToCSVBtn").addEventListener("click", () => {
        alert("📄 This will export the stamping report.");
    });

    renderStampingTables()
    fetchCurrentUser()


}
// Simulated session username (replace with real session later)
let currentUser = ""; // or dynamically set this after login
let stampedComplete = [];
let currentInProgress = []; // we'll fetch and store this




async function fetchCurrentUser() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const user = await response.json();
      currentUser = user.username; // or use user.first_name + " " + user.last_name
      console.log("✅ Logged in as:", currentUser);
    } else {
      console.warn("❌ Failed to fetch user info");
    }
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
}





async function renderStampingTables() {
  const inProgressBody = document.getElementById("inProgressTableBody");
  const completeBody = document.getElementById("completeTableBody");

  inProgressBody.innerHTML = "";
  completeBody.innerHTML = "";

  // Load released and stamped
  const [releasedComponents, previouslyStamped] = await Promise.all([
    fetchReleasedHTComponents(),
    fetchStampedRecords()
  ]);

  // Save stamped globally
  stampedComplete = previouslyStamped;

  // Filter out already stamped serials
  const stampedSerials = new Set(previouslyStamped.map(item => item.serial));
  const unstampedComponents = releasedComponents.filter(
    item => !stampedSerials.has(item.serial)
  );

  // Render In Progress
  unstampedComponents.forEach(component => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.classList.add("text-primary", "fw-bold");
    row.onclick = () => moveToComplete(component);
    row.innerHTML = `
      <td>${component.serial}</td>
      <td>${component.cast_code}</td>
      <td>${component.heat_code}</td>
      <td>${component.product_name}</td>
    `;
    inProgressBody.appendChild(row);
  });

  // Render Stamped
  console.log("previouslyStamped: ", previouslyStamped);
  
  previouslyStamped.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.serial}</td>
      <td>${record.cast_code}</td>
      <td>${record.heat_code}</td>
      <td>${record.product_name || "-"}</td>
      <td>${record.user || "-"}</td>
      <td>${new Date(record.date).toLocaleString()}</td>
      <td>
        <button class="btn btn-sm btn-outline-warning" onclick="undoStamp(${index})">🔄 Undo</button>
      </td>
    `;
    completeBody.appendChild(row);
  });
}






async function moveToComplete(component) {
  // Save to backend first
  const saved = await saveStampedRecord(component);
  if (!saved) return;

  // Add to stamped list with returned record (including ID)
  stampedComplete.unshift(saved);

  // Remove from in-progress table
  const inProgressBody = document.getElementById("inProgressTableBody");
  const rowToRemove = [...inProgressBody.rows].find(row =>
    row.cells[0].innerText === component.serial
  );
  if (rowToRemove) rowToRemove.remove();

  // Append to complete table
  const completeBody = document.getElementById("completeTableBody");
  const row = document.createElement("tr");
  const index = 0; // always top
  row.innerHTML = `
    <td>${saved.serial}</td>
    <td>${saved.cast_code}</td>
    <td>${saved.heat_code}</td>
    <td>${saved.product_name || "-"}</td>
    <td>${saved.user || currentUser}</td>
    <td>${new Date(saved.date).toLocaleString()}</td>
    <td>
      <button class="btn btn-sm btn-outline-warning" onclick="undoStamp(${index})">🔄 Undo</button>
    </td>
  `;
  completeBody.insertBefore(row, completeBody.firstChild);
}







export async function undoStamp(index) {
  const record = stampedComplete[index];

  if (!record || !record.id) {
    console.warn("⚠️ No record ID found for undo.");
    return;
  }

  const confirmed = confirm(`Are you sure you want to undo stamping for serial "${record.serial}"?`);
  if (!confirmed) return; // ❌ User canceled

  await deleteStampedRecord(record.id);

  // Remove from DOM
  const completeBody = document.getElementById("completeTableBody");
  const row = completeBody.rows[index];
  if (row) row.remove();

  // Remove from memory
  stampedComplete.splice(index, 1);

  // Re-add to in-progress DOM
  const inProgressBody = document.getElementById("inProgressTableBody");
  const newRow = document.createElement("tr");
  newRow.style.cursor = "pointer";
  newRow.classList.add("text-primary", "fw-bold");
  newRow.onclick = () => moveToComplete(record);
  newRow.innerHTML = `
    <td>${record.serial}</td>
    <td>${record.cast_code}</td>
    <td>${record.heat_code}</td>
    <td>${record.product_name || "-"}</td>
  `;
  inProgressBody.appendChild(newRow);
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



async function saveStampedRecord(component) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/stamping/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serial: component.serial,
        cast_code: component.cast_code,
        heat_code: component.heat_code
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error saving record:", errorData);
      alert("❌ Failed to save stamping record.");
      return null;
    }

    const savedRecord = await response.json();
    console.log("✅ Record saved:", savedRecord);
    return savedRecord;

  } catch (error) {
    console.error("Network error:", error);
    alert("❌ Network error while saving.");
    return null;
  }
}





async function fetchReleasedHTComponents() {
  const token = localStorage.getItem("authToken"); // adjust if stored elsewhere

  try {
    const response = await fetch("http://127.0.0.1:8000/api/heat-treatment/components/unstamped/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch released components");
    return await response.json();
  } catch (error) {
    console.error("❌ Error loading released HT components:", error);
    return [];
  }
}


async function fetchStampedRecords() {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/stamping/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to load stamped records");
    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching stamped records:", error);
    return [];
  }
}



async function deleteStampedRecord(id) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/stamping/${id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to delete stamping record");
    console.log(`✅ Record ${id} deleted.`);
  } catch (error) {
    console.error("❌ Error deleting record:", error);
    alert("❌ Failed to undo stamping.");
  }
}
