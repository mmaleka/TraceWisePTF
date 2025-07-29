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

    const token = localStorage.getItem("authToken");


    
    // const utRecords = []; // Your table data
    const utTableBody = document.getElementById("utTableBody");
    document.getElementById("Product").value = "155mm HE";

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const newRecord = {
      serialNumber: document.getElementById("serialNumber").value,
      castCode: document.getElementById("castCode").value,
      heatCode: document.getElementById("heatCode").value,
      op_desc: document.getElementById("opDesc").value,
      machine_no: document.getElementById("machineNo").value,
      determination: document.getElementById("cncDetermination").value,
      comments: document.getElementById("cncComments").value || "-",
      shift: getCurrentShift()
    };

    try {
      const response = await fetch("https://tracewiseptf.onrender.com/api/cnc_machining/cnc-machining/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRecord)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || Object.values(data).join(" "));
      }

      const savedRecord = await response.json();

      // Append to frontend table with user and date info
      utRecords.unshift({
        ...newRecord,
        user: currentUser,
        date: new Date(savedRecord.date).toLocaleString()
      });

      renderUTTable();
      this.reset();
      closeFormPanel();
    } catch (err) {
      console.error("❌ Error saving CNC record:", err.message);
      
      // ✅ Show in alert or below form
      const messageDiv = document.getElementById("utMessage");
      messageDiv.textContent = `❌ ${err.message}`;
      messageDiv.style.color = "red";
      // alert("❌ Failed to save CNC record.");
    }



    utRecords.unshift(newRecord);
        renderUTTable();
    this.reset();
        closeFormPanel();
    });






    // Initial render
    fetchCurrentUser();
    populateOPDescOptions();
    loadCNCMachiningRecords();


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
   








let currentUser = "Unknown";
const utRecords = []; // Global CNC records array

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



async function populateOPDescOptions() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/cnc_machining/cnc-operations/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {
      const products = await response.json();
      const select = document.getElementById("opDesc");
      select.innerHTML = '<option value="" disabled selected>Select a product</option>';
      products.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error loading products descriptions:", err);
  }
}



async function loadCNCMachiningRecords() {
  console.log("loadCNCMachiningRecords");
  
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {

    const opDesc = "Final Machine Ogive"; // or "Pre-machine Ogive", etc.

    const response = await fetch(`https://tracewiseptf.onrender.com/api/cnc_machining/cnc-machining?op_desc=${encodeURIComponent(opDesc)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // const response = await fetch("https://tracewiseptf.onrender.com/api/cnc_machining/cnc-machining", {
    //   headers: {
    //     "Authorization": `Bearer ${token}`,
    //     "Content-Type": "application/json"
    //   }
    // });

    if (!response.ok) {
      throw new Error("Failed to fetch CNC records");
    }

    const data = await response.json();
    console.log("data: ", data);

    // Convert and populate into utRecords
    utRecords.length = 0; // Clear old values
    data.forEach(record => {
      utRecords.push({
        opDesc: record.op_desc,
        machineNo: record.machine_no,
        product: record.product,
        determination: record.determination,
        comments: record.comments || "-",
        shift: record.shift,
        user: record.recorded_by_username || "Unknown",
        date: new Date(record.date_recorded).toLocaleString()
      });
    });

    renderUTTable();
  } catch (error) {
    console.error("❌ Error loading CNC records:", error);
  }
}









function renderUTTable() {
  const tbody = document.getElementById("utTableBody");
  tbody.innerHTML = "";
  if (utRecords.length === 0) {
      utTableBody.innerHTML = "<tr><td colspan='10'>No Machining Records found.</td></tr>";
      return;
  }

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
