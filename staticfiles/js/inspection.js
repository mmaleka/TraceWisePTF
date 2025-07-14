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



}    

// Simulated session username (replace with real session later)
const currentUser = "j.molefe"; // or dynamically set this after login
let currentProduct = "M0121 Body"; // default on load


function openFormPanel() {
    document.getElementById("utFormPanel").classList.add("open");

    // Optional overlay
    const overlay = document.createElement("div");
    overlay.id = "utOverlay";
    overlay.className = "ut-overlay";
    overlay.onclick = closeFormPanel;
    document.body.appendChild(overlay);
  }

  function closeFormPanel() {
    document.getElementById("utFormPanel").classList.remove("open");

    const overlay = document.getElementById("utOverlay");
    if (overlay) overlay.remove();
  }






  // Handle form submission
export function handleFormSubmit(event) {
    event.preventDefault(); // Prevent page reload

    // Fetch input values
    var shellNumber = document.getElementById('shell-number').value;
    var castCode = document.getElementById('cast-code').value;
    var heatCode = document.getElementById('heat-code').value;
    var inspector = currentUser;
    var allowDuplicate = document.getElementById('allowDuplicate').checked;
    var determination = ""; // Can remain empty initially
    var date = getCurrentDate();

    console.log("allowDuplicate: ", allowDuplicate)
    // Validate inputs (optional but recommended)
    if (!shellNumber || !castCode || !heatCode) {
        alert("Please fill in all required fields.");
        return;
    }

    // Generate composite key
    const newKey = `${shellNumber}_${castCode}_${heatCode}`;

    // 🔍 Check for duplicate composite key
    const existingData = hot.getSourceData();
    const isDuplicate = existingData.some(row => {
        const existingKey = `${row["Shell Number"]}_${row["Cast Code"]}_${row["Heat Code"]}`;
        return existingKey === newKey;
    });


    if (isDuplicate && !allowDuplicate) {
        alert("❌ Duplicate entry detected. Check 'Allow duplicate Shells' to proceed.");
        return;
    }

    // Construct row object
    var newRow = {
        "Shell Number": shellNumber,
        "Cast Code": castCode,
        "Heat Code": heatCode,
        "Inspector": inspector,
        "Determination": determination,
        "Defects": (isDuplicate && allowDuplicate) ? "Duplicate" : "",
        "Date": date,
        
        // Add dimensions
        "Dim 1": "", "Dim 2": "", "Dim 3": "", "Dim 4": "", "Dim 5": "",
        "Dim 6": "", "Dim 7": "", "Dim 8": "", "Dim 9": "", "Dim 10": ""
    };

    // Insert row into Handsontable
    hot.alter('insert_row');
    const newIndex = hot.countRows() - 1;
    Object.keys(newRow).forEach((key) => {
        hot.setDataAtRowProp(newIndex, key, newRow[key]);
    });

    // productData[currentProduct].push(newRow);
    // hot.loadData(productData[currentProduct]);


    // Optional: reset form fields
    // Reset specific fields
    document.getElementById('shell-number').value = "";
    document.getElementById('allowDuplicate').checked = false;
}
// Expose globally so inline HTML can access it
window.handleFormSubmit = handleFormSubmit;




const data_M0121 = [
  {
    "Shell Number": "SN001",
    "Cast Code": "CC101",
    "Heat Code": "HC202",
    "Inspector": "John",
    "Determination": "Rework",
    "Defects": "",
    "Date": "2025-Jul-08 10:00 am"
  },
  {
    "Shell Number": "SN002",
    "Cast Code": "CC102",
    "Heat Code": "HC203",
    "Inspector": "Alice",
    "Determination": "Pass",
    "Defects": "",
    "Date": "2025-Jul-08 10:15 am"
  },
  {
    "Shell Number": "SN002",
    "Cast Code": "CC102",
    "Heat Code": "HC203",
    "Inspector": "Alice",
    "Determination": "Scrap",
    "Defects": "",
    "Date": "2025-Jul-08 10:15 am"
  }
];

const productData = {
  "M0121 Body": data_M0121,
  "M2003 Body": [],
  "M2003 Ogive": [],
  "Pump": []
};

// function renderFITable() {
const container = document.getElementById('spreadsheet');
const hot = new Handsontable(container, {
data: productData[currentProduct],
colHeaders: ["Shell Number", "Cast Code", "Heat Code", "Inspector", "Determination", "Defects", "Date", "Dim 1", "Dim 2", "Dim 3", "Dim 4", "Dim 5",
            "Dim 6", "Dim 7", "Dim 8", "Dim 9", "Dim 10"],
columns: [
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

rowHeaders: true,
filters: true,
dropdownMenu: true,
contextMenu: true,
licenseKey: "non-commercial-and-evaluation"
});

// }

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





export function saveChanges() {
  const updatedData = hot.getSourceData();
  console.log("Saving to backend (not implemented in CodePen):", updatedData);
  alert("Data saved (simulated).");
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
  currentProduct = document.getElementById("productToggle").value;
  hot.loadData(productData[currentProduct]); // Switch the data
  
  document.getElementById("productTitle").textContent =
  `✅ ${currentProduct} Final Inspection Results`;
}
// Expose globally so inline HTML can access it
window.switchProduct = switchProduct;
