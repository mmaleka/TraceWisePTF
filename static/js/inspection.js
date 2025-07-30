export function init() {

    document.getElementById("downloadExcelBtn").addEventListener("click", () => {
        alert("📄 This will export the final inspection data.");
    });
    document.getElementById("saveChangesBtn").addEventListener("click", () => {
          saveChanges()
    });
    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });
  
    fetchCurrentUser();
    // loadFinalInspectionRecords();
    populateProductOptions();

    // Reset title clearly
    document.getElementById("productTitle").textContent = "🛠 Please select a product";
  
  document.getElementById("productSelect").addEventListener("change", function () {
    const selectedProduct = this.value;
    const addBtn = document.getElementById("openFormPanelBtn");

    if (selectedProduct) {
      addBtn.disabled = false;
    } else {
      addBtn.disabled = true;
    }

    switchProduct();  // if you want to reload the table
  });



}    

// Simulated session username (replace with real session later)
let currentUser = "Unknown"; // or dynamically set this after login
let currentProduct = ""; // default on load
const productData = {
  "1": [],
  "2": [],
  "3": [],
  "4": []
};
const token = localStorage.getItem("authToken");


function openFormPanel() {
  document.getElementById("utFormPanel").classList.add("open");

  // Optional overlay
  const overlay = document.createElement("div");
  overlay.id = "utOverlay";
  overlay.className = "ut-overlay";
  overlay.onclick = closeFormPanel;
  document.body.appen
  dChild(overlay);
}

function closeFormPanel() {
  document.getElementById("utFormPanel").classList.remove("open");

  const overlay = document.getElementById("utOverlay");
  if (overlay) overlay.remove();
}






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




async function populateProductOptions() {

  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/products/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (response.ok) {
      const products = await response.json();
      const select = document.getElementById("productSelect");
      select.innerHTML = '<option value="" disabled selected>Select a product</option>';
      products.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}





// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  const messageBox = document.getElementById("utMessage");

  const shellNumber = document.getElementById('shell-number').value.trim();
  const castCode = document.getElementById('cast-code').value.trim();
  const heatCode = document.getElementById('heat-code').value.trim();
  const inspector = currentUser;
  const allowDuplicate = document.getElementById('allowDuplicate').checked;
  const determination = "";
  const date = getCurrentDate();

  if (!shellNumber || !castCode || !heatCode) {
    alert("Please fill in all required fields.");
    return;
  }

  const newKey = `${shellNumber}_${castCode}_${heatCode}`;
  const existingData = hot.getSourceData();
  const isDuplicate = existingData.some(row => {
    const existingKey = `${row["Shell Number"]}_${row["Cast Code"]}_${row["Heat Code"]}`;
    return existingKey === newKey;
  });

  if (isDuplicate && !allowDuplicate) {
    alert("❌ Duplicate entry detected. Check 'Allow duplicate Shells' to proceed.");
    return;
  }

  // 🔍 Server-side validation
  const { valid, message } = await validateBeforeInsert(shellNumber, castCode, heatCode);
  if (!valid) {
    console.log("message: ", message)
    messageBox.textContent = `❌ ${typeof message === "string" ? message : JSON.stringify(message)}`;

    messageBox.classList.remove("text-success");
    messageBox.classList.add("text-danger");
    messageBox.style.display = "block"; // Force visible
    return;
  }
  
  // Optional: Clear previous message if valid
  messageBox.textContent = "";

  const newRow = {
    "Shell Number": shellNumber,
    "Cast Code": castCode,
    "Heat Code": heatCode,
    "Inspector": inspector,
    "Determination": determination,
    "Defects": (isDuplicate && allowDuplicate) ? "Duplicate" : "",
    "Date": date,
    "Dim 1": "", "Dim 2": "", "Dim 3": "", "Dim 4": "", "Dim 5": "",
    "Dim 6": "", "Dim 7": "", "Dim 8": "", "Dim 9": "", "Dim 10": ""
  };

  // Insert into Handsontable
  hot.alter('insert_row');
  const newIndex = hot.countRows() - 1;
  for (const key in newRow) {
    hot.setDataAtRowProp(newIndex, key, newRow[key]);
  }
  await loadFinalInspectionRecords();

  // Reset form fields
  document.getElementById('shell-number').value = "";
  document.getElementById('allowDuplicate').checked = false;
}
// Expose globally so inline HTML can access it
window.handleFormSubmit = handleFormSubmit;


 



const container = document.getElementById('spreadsheet');

const dirtyRows = new Set(); // Track modified row indexes

const hot = new Handsontable(container, {
  // data: data,
  data: productData[currentProduct],
  colHeaders: ["ID", "Shell Number", "Cast Code", "Heat Code", "Inspector", "Determination", "Defects", "Date", "Dim 1", "Dim 2", "Dim 3", "Dim 4", "Dim 5",
               "Dim 6", "Dim 7", "Dim 8", "Dim 9", "Dim 10"],
  columns: [
    { data: "id", readOnly: true },
    { data: "Shell Number" },
    { data: "Cast Code" },
    { data: "Heat Code" },
    { data: "Inspector" },
    {
      data: "Determination",
      type: "dropdown",
      source: ["Pass", "Rework", "Scrap"]
    },
    {
      data: "Defects",
      type: "autocomplete",
      source: ["Crack", "Dent", "Oversize", "Undersize", "Misalignment", "Porosity", "Duplicate"],
      strict: false,
      allowInvalid: true,
      placeholder: "Type defects separated by commas"
    },
    { data: "Date" },

    // Dim 1 to Dim 10
    { data: "Dim 1", type: "numeric" },
    { data: "Dim 2", type: "numeric" },
    { data: "Dim 3", type: "numeric" },
    { data: "Dim 4", type: "numeric" },
    { data: "Dim 5", type: "numeric" },
    { data: "Dim 6", type: "numeric" },
    { data: "Dim 7", type: "numeric" },
    { data: "Dim 8", type: "numeric" },
    { data: "Dim 9", type: "numeric" },
    { data: "Dim 10", type: "numeric" }
  ],
  
  cells: function (row, col) {
    const cellProperties = {};

    if (this.instance.getData()[row] && this.instance.getColHeader(col) === "Determination") {
      const value = this.instance.getData()[row][col];
      if (value === "Pass") {
        cellProperties.className = 'bg-success text-white';
      } else if (value === "Rework") {
        cellProperties.className = 'bg-warning text-dark';
      } else if (value === "Scrap") {
        cellProperties.className = 'bg-danger text-white';
      }
    }

    return cellProperties;
  },
  
  
  afterChange: function (changes, source) {
    if (source === 'loadData' || !changes) return;

    changes.forEach(([row]) => {
      dirtyRows.add(row);
    });
  },
  
  

  rowHeaders: true,
  filters: true,
  dropdownMenu: true,
  contextMenu: true,
  licenseKey: "non-commercial-and-evaluation"
});







async function validateBeforeInsert(serial, cast_code, heat_code) {
  const token = localStorage.getItem("authToken");
  if (!token) return { valid: false, message: "You are not logged in." };

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/final_inspection/final-inspection/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify([{ serial, cast_code, heat_code }])
    });

    if (response.status === 400) {
      const { errors } = await response.json();
      const match = errors.find(e => e.serial === serial);
      return { valid: false, message: match?.error || "Validation failed." };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, message: "Network error during validation." };
  }
}



export function getCurrentDate() {
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hours = now.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${now.getFullYear()}-${monthNames[now.getMonth()]}-${String(now.getDate()).padStart(2, '0')} ${hour12}:${minute} ${ampm}`;
}
// Expose globally so inline HTML can access it
window.getCurrentDate = getCurrentDate;




export async function saveChanges() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("❌ You are not logged in.");
    return;
  }

  const data = hot.getSourceData();
  const rowsToSave = Array.from(dirtyRows).map(index => data[index]);

  if (rowsToSave.length === 0) {
    alert("✅ No changes to save.");
    return;
  }

  const updates = [];
  const creates = [];

  for (const row of rowsToSave) {
    if (!row["Shell Number"] || !row["Cast Code"] || !row["Heat Code"]) {
      alert("❌ Missing required fields: Shell Number, Cast Code, or Heat Code.");
      return;
    }

    const payload = {
      serial: row["Shell Number"],
      cast_code: row["Cast Code"],
      heat_code: row["Heat Code"],
      determination: row["Determination"],
      defects: row["Defects"],
      dim_1: row["Dim 1"],
      dim_2: row["Dim 2"],
      dim_3: row["Dim 3"],
      dim_4: row["Dim 4"],
      dim_5: row["Dim 5"],
      dim_6: row["Dim 6"],
      dim_7: row["Dim 7"],
      dim_8: row["Dim 8"],
      dim_9: row["Dim 9"],
      dim_10: row["Dim 10"]
    };

    if (row.id) {
      updates.push({ id: row.id, data: payload });
    } else {
      creates.push(payload);
    }
  }

  try {
    for (const { id, data } of updates) {
      await fetch(`https://tracewiseptf.onrender.com/api/final_inspection/final-inspection/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
    }

    if (creates.length > 0) {
      const response = await fetch(`https://tracewiseptf.onrender.com/api/final_inspection/final-inspection/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(creates)
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const messages = errorData.errors.map(err => {
            const serial = err.serial || "Unknown Serial";
            const detail = Array.isArray(err.error)
              ? err.error.join(", ")
              : typeof err.error === "string"
              ? err.error
              : JSON.stringify(err.error);
            return `❌ ${serial}: ${detail}`;
          });

          alert("❌ Some records failed to save:\n\n" + messages.join("\n"));
        } else if (errorData.detail) {
          alert("❌ Error: " + errorData.detail);
        } else {
          alert("❌ Failed to save data due to an unknown error.");
        }

        return;
      }

      const newRecords = await response.json();

      newRecords.forEach((record) => {
        const newRowIndex = data.findIndex(row =>
          !row.id &&
          row["Shell Number"] === record.serial &&
          row["Cast Code"] === record.cast_code &&
          row["Heat Code"] === record.heat_code
        );

        record.id = parseInt(record.id, 10);
        if (Number.isInteger(record.id) && record.id >= 0) {
          try {
            hot.setDataAtRowProp(newRowIndex, "id", record.id);
          } catch (e) {
            console.error("🔥 Handsontable rejected row update", {
              newRowIndex,
              id: record.id,
              record,
              error: e
            });
          }
        } else {
          console.warn("⚠️ Skipping invalid record.id:", record.id, record);
        }
      });
    }

    dirtyRows.clear();
    alert("✅ All changes saved.");
    await loadFinalInspectionRecords();
  } catch (err) {
    console.error("❌ Error saving data:", err);
    alert("❌ Failed to save data.");
  }
}
// Expose globally so inline HTML can access it
window.saveChanges = saveChanges;


export function downloadExcel() {
  const worksheet = XLSX.utils.json_to_sheet(hot.getSourceData());
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "FinalInspection");
  XLSX.writeFile(workbook, "final_inspection.xlsx");
}
// Expose globally so inline HTML can access it
window.downloadExcel = downloadExcel;



export function switchProduct() {
  
  currentProduct = document.getElementById("productSelect").value;
  loadFinalInspectionRecords();
  hot.loadData(productData[currentProduct]); // Switch the data
  
  const selectedOption = document.getElementById("productSelect").selectedOptions[0];
  const label = selectedOption ? selectedOption.textContent : "Please select a product";
  document.getElementById("productTitle").textContent = `✅ ${label} Final Inspection Results`;
}
// Expose globally so inline HTML can access it
window.switchProduct = switchProduct;





// ////////////
// NEW CODE HERE




async function loadFinalInspectionRecords() {
  const token = localStorage.getItem("authToken");
  const productId = document.getElementById("productSelect").value;
  if (!token) {
    alert("❌ You are not logged in.");
    return;
  }

  try {
    const response = await fetch(`https://tracewiseptf.onrender.com/api/final_inspection/final-inspection/?product=${productId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch inspection records");
    }

    const records = await response.json();

    // Filter for current product (optional: match by pattern or custom key)
    const formatted = records
      // optionally: .filter(r => r.product === currentProduct)
      .map(record => ({
        "id": record.id,
        "Shell Number": record.serial,
        "Cast Code": record.cast_code,
        "Heat Code": record.heat_code,
        "Inspector": record.inspector || "",
        "Determination": record.determination || "",
        "Defects": record.defects || "",
        "Date": record.date || "",
        "Dim 1": record.dim_1,
        "Dim 2": record.dim_2,
        "Dim 3": record.dim_3,
        "Dim 4": record.dim_4,
        "Dim 5": record.dim_5,
        "Dim 6": record.dim_6,
        "Dim 7": record.dim_7,
        "Dim 8": record.dim_8,
        "Dim 9": record.dim_9,
        "Dim 10": record.dim_10
      }));

    productData[currentProduct] = formatted;
    hot.loadData(formatted);
    dirtyRows.clear();
    console.log("✅ Inspection records loaded.");
  } catch (error) {
    console.error("❌ Failed to load records:", error);
    alert("❌ Could not load inspection records.");
  }
}




window.addEventListener("DOMContentLoaded", () => {
  init();
});






