export function init() {

    document.getElementById("verifyCofCBtn").addEventListener("click", () => {
        verifyCofC()
    });
    document.getElementById("printCofCBtn").addEventListener("click", () => {
        printCofC()
    });
  
    fetchCurrentUser();
    cofcId = getCofcIdFromURL();
    console.log("📄 CofC ID:", cofcId);

  //   if (!cofcId) {
  //     alert("❌ No CofC ID found in the URL.");
  //     return;
  //   }

    // Optional: load existing CofC details
    loadCofcDetails(); //← create this if needed
    loadInspectionData();
    loadPalletComponents();


}

let currentUser = "Unknown";
let cofcId = null; // Make cofcId global
let isCofCVerified = false;
const { jsPDF } = window.jspdf;

async function loadCofcDetails() {
  const token = localStorage.getItem("authToken");
  cofcId = 1 // getCofcIdFromURL(); // Ensure cofcId is globally set
  if (!cofcId) return;

  try {
    const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/cofc/${cofcId}/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("data: ", data)
      document.getElementById("cocNumber").textContent = data.coc_number;
      document.getElementById("productName").textContent = data.product; // Or fetch product name from your DB/API
      document.getElementById("userName").textContent = data.user;
    } else {
      console.error("Failed to load CofC details.");
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}


function getCofcIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
      currentUser = user.username;
      console.log("✅ Logged in as:", currentUser);
    } else {
      console.warn("❌ Failed to fetch user info");
    }
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
}




const inspectionTableBody = document.querySelector("#inspectionTable tbody");

async function loadInspectionData() {
  console.log("loadInspectionData")
  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/final_inspection/available/", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch inspection data");
    }

    const inspectionData = await response.json();

    inspectionData.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.serial}</td><td>${item.cast_code}</td><td>${item.heat_code}</td>`;
      row.style.cursor = "pointer";
      row.addEventListener("click", () => moveToPallet(row));
      inspectionTableBody.appendChild(row);
    });

    console.log("✅ Inspection data loaded:", inspectionData);
  } catch (error) {
    console.error("❌ Error loading inspection data:", error);
  }
}


function addComponentToPallet(component) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${component.serial}</td>
    <td>${component.cast_code}</td>
    <td>${component.heat_code}</td>
  `;

  // Add remove button
  const removeTd = document.createElement("td");
  removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
  removeTd.querySelector("button").addEventListener("click", (e) => {
    e.stopPropagation();
    removeFromPallet(row);
  });
  row.appendChild(removeTd);

  // Store component ID for deletion
  row.dataset.componentId = component.id;

  palletTable.appendChild(row);
}


async function loadPalletComponents() {
  let cocId = document.getElementById("cocNumber").dataset.id;
  cocId=1
  if (!cocId) return;

  try {
    const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/components/?certificate=${cocId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pallet components");
    }

    const components = await response.json();
    components.forEach(component => addComponentToPallet(component));
    console.log("✅ Pallet loaded:", components);
  } catch (err) {
    console.error("❌ Error loading pallet:", err);
  }
}








async function moveToPallet(row) {
  console.log("adding to Pallet")
  // Add remove button if not already present
  if (!row.querySelector(".remove-btn")) {
    const removeTd = document.createElement("td");
    removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
    removeTd.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromPallet(row);
    });
    row.appendChild(removeTd);
  }

  // Extract values from the clicked row
  const cells = row.querySelectorAll("td");
  const shell = cells[0].innerText.trim();
  const cast = cells[1].innerText.trim();
  const heat = cells[2].innerText.trim();

  // Get CofC ID (assumes it's stored in a hidden span or data attribute)
  let cocId = document.getElementById("cocNumber").dataset.id;  // Example: <span id="cocNumber" data-id="1">0001</span>
  cocId=1
  if (!cocId) {
    console.warn("❌ CofC ID not found. Cannot save component.");
    return;
  }

  // Prepare component payload
  const componentData = {
    certificate: cocId,
    serial: shell,
    cast_code: cast,
    heat_code: heat
  };

  // Send POST request
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch("https://tracewiseptf.onrender.com/api/certificate/components/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(componentData)
    });

    if (response.ok) {
      const savedComponent = await response.json();  // <== ADD THIS

      console.log("✅ Component saved:", savedComponent);
      // Store the backend ID on the row
      row.dataset.componentId = savedComponent.id;
      
      palletTable.appendChild(row);  // Move row after save
    } else {
      const error = await response.json();
      console.error("❌ Error saving component:", error);
      alert("Failed to save component. Check console for details.");
    }
  } catch (err) {
    console.error("⚠️ Network or server error:", err);
    alert("Network error while saving component.");
  }
}



async function removeFromPallet(row) {
  const componentId = row.dataset.componentId;
  console.log("componentId: ", componentId)

  // If the row has a backend ID, delete from backend
  if (componentId) {
    const confirmed = confirm("Are you sure you want to remove this component?");
    if (!confirmed) return;

    try {
      const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/components/${componentId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Failed to delete component:", error);
        alert("Failed to delete component from server.");
        return;
      }

      console.log(`✅ Component ${componentId} deleted from backend`);
    } catch (err) {
      console.error("⚠️ Network error during deletion:", err);
      alert("Error deleting component.");
      return;
    }
  }

  // Remove the delete button (last cell)
  const lastCell = row.lastElementChild;
  if (lastCell && (lastCell.classList.contains("remove-btn") || lastCell.querySelector(".remove-btn"))) {
    row.removeChild(lastCell);
  }

  // Remove backend reference
  delete row.dataset.componentId;

  // Move the row back to inspection table
  inspectionTableBody.appendChild(row);
}






// function moveToPallet(row) {
//   // Add remove button cell
//   if (!row.querySelector(".remove-btn")) {
//     const removeTd = document.createElement("td");
//     removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
//     removeTd.querySelector("button").addEventListener("click", (e) => {
//       e.stopPropagation();  // Prevent row click triggering
//       removeFromPallet(row);
//     });
//     row.appendChild(removeTd);
//   }

//   // Move row to pallet table
//   palletTable.appendChild(row);
// }


// function removeFromPallet(row) {
//   // Remove the last cell (remove button)
//   const lastCell = row.lastElementChild;
//   if (lastCell && lastCell.classList.contains("remove-btn") || lastCell.querySelector(".remove-btn")) {
//     row.removeChild(lastCell);
//   }
//   // Move row back to inspection table
//   inspectionTableBody.appendChild(row);
// }




// Global records array




// function verifyCofC() {
//   const palletRows = palletTable.querySelectorAll("tr");
//   const palletData = Array.from(palletRows).map(row => {
//     const cells = row.querySelectorAll("td");
//     return {
//       shell: cells[0].innerText,
//       cast: cells[1].innerText,
//       heat: cells[2].innerText
//     };
//   });
//   console.log("✅ CofC Verified with Pallet Data:", palletData);

//   // Example incoming JSON verification status:
//   const verificationStatus = {
//     missing: {
//       heat_treatment: ["SH-001-AA01-HT01"],
//       UT: "All Complete",
//       Banding: "All Complete",
//       MPI: "All Complete",
//       Balancing: ["SH-003-AA01-HT01"],
//       final_inspection: "All Complete"
//     }
//   };

//   // Update modal content dynamically
//   updateVerificationSummaryTable(verificationStatus.missing);

//   // Mark as verified
//   isCofCVerified = true;

//   // Enable Print button
//   document.getElementById("printCofCBtn").disabled = false;

//   // Show modal
//   const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
//   modal.show();
// }





// function printCofC() {
  
//   if (!isCofCVerified) {
//     alert("⚠️ Please verify the CofC before printing.");
//     return;
//   }
  
//   const allChecksPassed = true;

//   if (allChecksPassed && Records.length > 0) {
//     const latest = Records[0];

//     // Extract pallet data rows
//     const palletRows = palletTable.querySelectorAll("tr");
//     const palletData = Array.from(palletRows).map(row => {
//       const cells = row.querySelectorAll("td");
//       return {
//         shell: cells[0].innerText,
//         cast: cells[1].innerText,
//         heat: cells[2].innerText
//       };
//     });

//     generateCofCPDF(
//       latest.cocnumber,
//       latest.product,
//       latest.user,
//       latest.date,
//       palletData // pass pallet items here!
//     );
//   } else {
//     alert("❌ Cannot generate CofC PDF. Some checks are incomplete.");
//   }
// }








// function generateCofCPDF(cocNumber, product, user, date, palletItems = []) {
//   const doc = new jsPDF();
  
//   // Your Base64 logo string here:
//   const logoBase64 = "";  // <-- replace with your actual logo Base64

//   // Add logo image to PDF (x=20, y=10, width=40, height=20)
//   doc.addImage(logoBase64, 'PNG', 20, 10, 60, 30);

//   doc.setFontSize(14);
//   doc.text("CERTIFICATE OF CONFORMANCE", 130, 20, null, null, "center");

//   doc.setFontSize(10);
//   doc.text(`CofC Number: ${cocNumber}`, 20, 40);
//   doc.text(`Product Description: ${product}`, 20, 50);
//   doc.text(`Issued By: ${user}`, 20, 60);
//   doc.text(`Date Issued: ${date}`, 20, 70);

//   // Certification Statement
//   doc.setFont(undefined, 'bold');
//   doc.text("Certification Statement:", 20, 85);
//   doc.setFont(undefined, 'normal');
//   doc.text(
//     "This certifies that the items listed below have been manufactured and inspected in accordance with the contractual requirements, technical specifications, and applicable quality standards.",
//     20, 90, { maxWidth: 170 }
//   );

//   // Checklist with Batches
//   doc.setFont(undefined, 'bold');
//   doc.text("Checklist Summary:", 20, 110);
//   doc.setFont(undefined, 'normal');

//   const checklist = [
//     "✔ Heat Treatment & Tensile: AAS-HAA; AAV-HAB; AAA-HAA",
//     "✔ Duplicates: None",
//     "✔ Ultrasonic Testing: All Complete",
//     "✔ Banding : All Complete",
//     "✔ MPI: All Complete",
//     "✔ Balancing Data: All Complete",
//     "✔ Final Inspection: All Complete"
//   ];

//   checklist.forEach((line, idx) => {
//     doc.text(line, 25, 115 + idx * 7);
//   });

//   // Calculate starting Y after checklist
//   let startY = 120 + checklist.length * 7 + 10;

//   // Pallet Items Table
//   if (palletItems.length > 0) {
//     doc.setFont(undefined, 'bold');
//     doc.text("Pallet Items:", 20, startY);
//     startY += 7;

//     // Table header
//     doc.setFont(undefined, 'bold');
//     doc.text("Shell #", 25, startY);
//     doc.text("Cast Code", 70, startY);
//     doc.text("Heat Code", 130, startY);
//     startY += 5;

//     // Horizontal line under header
//     doc.line(20, startY, 190, startY);
//     startY += 3;

//     doc.setFont(undefined, 'normal');
//     palletItems.forEach(item => {
//       doc.text(item.shell, 25, startY);
//       doc.text(item.cast, 70, startY);
//       doc.text(item.heat, 130, startY);
//       startY += 7;
//     });
//   }

//   // Now place Conformance Statement BELOW the pallet items table (or checklist if no pallet items)
//   startY += 10;  // add some space before conformance statement

//   doc.setFont(undefined, 'bold');
//   doc.text("", 20, startY);
//   startY += 6;

//   doc.setFont(undefined, 'normal');
//   doc.text(
//     "",
//     20, startY, { maxWidth: 170 }
//   );

//   // Move startY down to allow for multiline text height (~20-30 units)
//   startY += 30;

//   // Signature lines
//   doc.line(20, startY + 20, 80, startY + 20);
//   doc.text("Quality Signature", 20, startY + 25);

//   doc.line(120, startY + 20, 180, startY + 20);
//   doc.text("Date", 120, startY + 25);

//   // Save PDF
//   doc.save(`CofC_${cocNumber}.pdf`);
// }









export function filterInspectionData() {
  const search = document.getElementById("inspectionSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#inspectionTable tbody tr");

  console.log("Search input:", search);
  console.log("Rows found:", rows.length); // ← Should be > 0

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
}
window.filterInspectionData = filterInspectionData;




// function updateVerificationSummaryTable(missingData) {
//   const container = document.getElementById('verificationTableContainer');
//   container.innerHTML = ''; // Clear previous content

//   // Table header
//   let tableHTML = `
//     <table class="table table-bordered table-sm">
//       <thead class="table-light">
//         <tr>
//           <th>Component</th>
//           <th>Status</th>
//           <th>Missing Items</th>
//         </tr>
//       </thead>
//       <tbody>
//   `;

//   const displayNames = {
//     heat_treatment: "Heat Treatment & Tensile",
//     UT: "UT",
//     MPI: "MPI",
//     Balancing: "Balancing Data",
//     final_inspection: "Final Inspection"
//   };

//   for (const key in missingData) {
//     const value = missingData[key];
//     const displayName = displayNames[key] || key;

//     let statusText = '';
//     let missingText = '';

//     if (Array.isArray(value)) {
//       if (value.length === 0) {
//         statusText = `<span class="text-success">All Complete</span>`;
//         missingText = '-';
//       } else {
//         statusText = `<span class="text-danger">Missing</span>`;
//         missingText = value.join(", ");
//       }
//     } else if (typeof value === 'string') {
//       if (value.toLowerCase().includes('complete')) {
//         statusText = `<span class="text-success">${value}</span>`;
//         missingText = '-';
//       } else {
//         statusText = `<span class="text-danger">${value}</span>`;
//         missingText = '-';
//       }
//     } else {
//       statusText = `<span class="text-muted">Unknown status</span>`;
//       missingText = '-';
//     }

//     tableHTML += `
//       <tr>
//         <td>${displayName}</td>
//         <td>${statusText}</td>
//         <td style="word-break: break-word; max-width: 250px;">${missingText}</td>
//       </tr>
//     `;
//   }

//   tableHTML += '</tbody></table>';
//   container.innerHTML = tableHTML;
// }

function updateVerificationSummaryTable(missingData) {
  const container = document.getElementById('verificationTableContainer');
  container.innerHTML = ''; // Clear previous content

  // Table header
  let tableHTML = `
    <table class="table table-bordered table-sm">
      <thead class="table-light">
        <tr>
          <th>Component</th>
          <th>Status</th>
          <th>Missing Items</th>
        </tr>
      </thead>
      <tbody>
  `;

  const displayNames = {
    heat_treatment: "Heat Treatment & Tensile",
    UT: "UT",
    Banding: "Banding",
    MPI: "MPI",
    // Balancing: "Balancing Data",
    final_inspection: "Final Inspection"
  };

  for (const key in missingData) {
    const value = missingData[key];
    const displayName = displayNames[key] || key;

    let statusText = '';
    let missingText = '';

    if (Array.isArray(value)) {
      if (value.length === 0) {
        statusText = `<span class="text-success">All Complete</span>`;
        missingText = '-';
      } else {
        statusText = `<span class="text-danger">Missing</span>`;
        // Join each item. If item is a list, join its contents.
        missingText = value.map(item => {
          return Array.isArray(item) ? item.join(" | ") : item;
        }).join(", ");
      }
    } else if (typeof value === 'string') {
      if (value.toLowerCase().includes('complete')) {
        statusText = `<span class="text-success">${value}</span>`;
        missingText = '-';
      } else {
        statusText = `<span class="text-danger">${value}</span>`;
        missingText = '-';
      }
    } else {
      statusText = `<span class="text-muted">Unknown status</span>`;
      missingText = '-';
    }

    tableHTML += `
      <tr>
        <td>${displayName}</td>
        <td>${statusText}</td>
        <td style="word-break: break-word; max-width: 250px;">${missingText}</td>
      </tr>
    `;
  }

  tableHTML += '</tbody></table>';
  container.innerHTML = tableHTML;
}



























//////////////////
// Old code
/////////////////


// let currentUser = "Unknown";
// let cofcId = null; // Make cofcId global
// let isCofCVerified = false;
// const { jsPDF } = window.jspdf;

// async function loadCofcDetails() {
//   const token = localStorage.getItem("authToken");
//   cofcId = 1 // getCofcIdFromURL(); // Ensure cofcId is globally set
//   if (!cofcId) return;

//   try {
//     const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/cofc/${cofcId}/`, {
//       headers: { "Authorization": `Bearer ${token}` }
//     });

//     if (response.ok) {
//       const data = await response.json();
//       document.getElementById("cocNumber").textContent = data.coc_number;
//       document.getElementById("productName").textContent = data.product; // Or fetch product name from your DB/API
//       document.getElementById("userName").textContent = data.user;
//     } else {
//       console.error("Failed to load CofC details.");
//     }
//   } catch (err) {
//     console.error("Network error:", err);
//   }
// }


// function getCofcIdFromURL() {
//   const params = new URLSearchParams(window.location.search);
//   return params.get("id");
// }

// async function fetchCurrentUser() {
//   const token = localStorage.getItem("authToken");
//   if (!token) return;

//   try {
//     const response = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
//       headers: {
//         "Authorization": `Bearer ${token}`,
//         "Content-Type": "application/json"
//       }
//     });

//     if (response.ok) {
//       const user = await response.json();
//       currentUser = user.username;
//       console.log("✅ Logged in as:", currentUser);
//     } else {
//       console.warn("❌ Failed to fetch user info");
//     }
//   } catch (err) {
//     console.error("Error fetching current user:", err);
//   }
// }


// const inspectionTableBody = document.querySelector("#inspectionTable tbody");

// async function loadInspectionData() {
//   try {
//     const response = await fetch("https://tracewiseptf.onrender.com/api/final_inspection/final-inspection/", {
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
//         "Content-Type": "application/json"
//       }
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch inspection data");
//     }

//     const inspectionData = await response.json();

//     inspectionData.forEach((item) => {
//       const row = document.createElement("tr");
//       row.innerHTML = `<td>${item.serial}</td><td>${item.cast_code}</td><td>${item.heat_code}</td>`;
//       row.style.cursor = "pointer";
//       row.addEventListener("click", () => moveToPallet(row));
//       inspectionTableBody.appendChild(row);
//     });

//     console.log("✅ Inspection data loaded:", inspectionData);
//   } catch (error) {
//     console.error("❌ Error loading inspection data:", error);
//   }
// }





// function addComponentToPallet(component) {
//   const row = document.createElement("tr");
//   row.innerHTML = `
//     <td>${component.serial}</td>
//     <td>${component.cast_code}</td>
//     <td>${component.heat_code}</td>
//   `;

//   // Add remove button
//   const removeTd = document.createElement("td");
//   removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
//   removeTd.querySelector("button").addEventListener("click", (e) => {
//     e.stopPropagation();
//     removeFromPallet(row);
//   });
//   row.appendChild(removeTd);

//   // Store component ID for deletion
//   row.dataset.componentId = component.id;

//   palletTable.appendChild(row);
// }


// async function loadPalletComponents() {
//   const cocId = document.getElementById("cocNumber").dataset.id;
//   if (!cocId) return;

//   try {
//     const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/components/?certificate=${cocId}`, {
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
//         "Content-Type": "application/json"
//       }
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch pallet components");
//     }

//     const components = await response.json();
//     components.forEach(component => addComponentToPallet(component));
//     console.log("✅ Pallet loaded:", components);
//   } catch (err) {
//     console.error("❌ Error loading pallet:", err);
//   }
// }








// async function moveToPallet(row) {
//   // Add remove button if not already present
//   if (!row.querySelector(".remove-btn")) {
//     const removeTd = document.createElement("td");
//     removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
//     removeTd.querySelector("button").addEventListener("click", (e) => {
//       e.stopPropagation();
//       removeFromPallet(row);
//     });
//     row.appendChild(removeTd);
//   }

//   // Extract values from the clicked row
//   const cells = row.querySelectorAll("td");
//   const shell = cells[0].innerText.trim();
//   const cast = cells[1].innerText.trim();
//   const heat = cells[2].innerText.trim();

//   // Get CofC ID (assumes it's stored in a hidden span or data attribute)
//   const cocId = document.getElementById("cocNumber").dataset.id;  // Example: <span id="cocNumber" data-id="1">0001</span>
//   if (!cocId) {
//     console.warn("❌ CofC ID not found. Cannot save component.");
//     return;
//   }

//   // Prepare component payload
//   const componentData = {
//     certificate: cocId,
//     serial: shell,
//     cast_code: cast,
//     heat_code: heat
//   };

//   // Send POST request
//   try {
//     const token = localStorage.getItem("authToken");

//     const response = await fetch("https://tracewiseptf.onrender.com/api/certificate/components/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify(componentData)
//     });

//     if (response.ok) {
//       const savedComponent = await response.json();  // <== ADD THIS

//       console.log("✅ Component saved:", savedComponent);
//       // Store the backend ID on the row
//       row.dataset.componentId = savedComponent.id;
      
//       palletTable.appendChild(row);  // Move row after save
//     } else {
//       const error = await response.json();
//       console.error("❌ Error saving component:", error);
//       alert("Failed to save component. Check console for details.");
//     }
//   } catch (err) {
//     console.error("⚠️ Network or server error:", err);
//     alert("Network error while saving component.");
//   }
// }



// async function removeFromPallet(row) {
//   const componentId = row.dataset.componentId;
//   console.log("componentId: ", componentId)

//   // If the row has a backend ID, delete from backend
//   if (componentId) {
//     const confirmed = confirm("Are you sure you want to remove this component?");
//     if (!confirmed) return;

//     try {
//       const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/components/${componentId}/`, {
//         method: "DELETE",
//         headers: {
//           "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         const error = await response.text();
//         console.error("❌ Failed to delete component:", error);
//         alert("Failed to delete component from server.");
//         return;
//       }

//       console.log(`✅ Component ${componentId} deleted from backend`);
//     } catch (err) {
//       console.error("⚠️ Network error during deletion:", err);
//       alert("Error deleting component.");
//       return;
//     }
//   }

//   // Remove the delete button (last cell)
//   const lastCell = row.lastElementChild;
//   if (lastCell && (lastCell.classList.contains("remove-btn") || lastCell.querySelector(".remove-btn"))) {
//     row.removeChild(lastCell);
//   }

//   // Remove backend reference
//   delete row.dataset.componentId;

//   // Move the row back to inspection table
//   inspectionTableBody.appendChild(row);
// }




// Global records array
const Records = [
  {
    cocnumber: "0001",
    product: "Shell Casing",
    user: "j.molefe",
    date: "2025-07-08 11:42 AM",
    quantity: 100,
    complete: "✔",
    comments: ""
  }
];



async function verifyCofC() {
  let cocId = document.getElementById("cocNumber").dataset.id;
  cocId=1
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`https://tracewiseptf.onrender.com/api/certificate/verify/?certificate=${cocId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Verification request failed");
    }

    const data = await response.json();
    const missing = data.missing;
    updateVerificationSummaryTable(missing);

    isCofCVerified = true;
    document.getElementById("printCofCBtn").disabled = false;

    const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
    modal.show();
  } catch (err) {
    console.error("❌ Verification failed:", err);
    alert("Verification error. See console.");
  }
}








function printCofC() {
  
  if (!isCofCVerified) {
    alert("⚠️ Please verify the CofC before printing.");
    return;
  }
  
  const allChecksPassed = true;

  if (allChecksPassed && Records.length > 0) {
    const latest = Records[0];

    // Extract pallet data rows
    const palletRows = palletTable.querySelectorAll("tr");
    const palletData = Array.from(palletRows).map(row => {
      const cells = row.querySelectorAll("td");
      return {
        shell: cells[0].innerText,
        cast: cells[1].innerText,
        heat: cells[2].innerText
      };
    });

    generateCofCPDF(
      latest.cocnumber,
      latest.product,
      latest.user,
      latest.date,
      palletData // pass pallet items here!
    );
  } else {
    alert("❌ Cannot generate CofC PDF. Some checks are incomplete.");
  }
}








function generateCofCPDF(cocNumber, product, user, date, palletItems = []) {
  const doc = new jsPDF();
  
  // Your Base64 logo string here:
  const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXAAAAB5CAYAAAAgYXpDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFv2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuMWI2NWE3OSwgMjAyMi8wNi8xMy0xNzo0NjoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMi0xMC0xMlQwNzo0MjowMyswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjItMTAtMTJUMDg6MzM6MzErMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMTAtMTJUMDg6MzM6MzErMDE6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MmQ0NDRiODQtNzY5OS03YTQ5LThhZjItMmFhNmZlMzc5MmZmIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkNCQ0E1NjJBNjkxMzExRTZCQTk3QjMwOEQyMURGMzg3IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDQTU2MkE2OTEzMTFFNkJBOTdCMzA4RDIxREYzODciIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0JDQTU2Mjc2OTEzMTFFNkJBOTdCMzA4RDIxREYzODciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0JDQTU2Mjg2OTEzMTFFNkJBOTdCMzA4RDIxREYzODciLz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MmQ0NDRiODQtNzY5OS03YTQ5LThhZjItMmFhNmZlMzc5MmZmIiBzdEV2dDp3aGVuPSIyMDIyLTEwLTEyVDA4OjMzOjMxKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjMuNSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+O7gjHAAAIcFJREFUeNrtnXmAFMUVxilBbsQFvECCroISQVQU1HAIrAcGI4iYxCterKIYNFEXDcQrUbzFiLoBEUVQUREFRV3PKKiIgngggRU18eBwvaJyb+o5X2ttbVV3dU93z+zu++PHLD3T3dVVXV9Xv3rvVT3Rd3Q9xkh9SQtJB8mhkoGSoySDJccoHI3PQZJf43dHSA6UbCtpyHXJMEwS1OWLJ3HeU9JTcqJkvGSW5GHJXMn7kpWSVZLNksqQfC/5ULIcx5speVTyT8lwycGSbpJCSTO+GRmGYQE3QyPhXpKzJTdK7pS8Lfk6gjDHyXrJaslbkkck10t+J+kqacI3KMMwdVHAG0kO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";  // <-- replace with your actual logo Base64

  // Add logo image to PDF (x=20, y=10, width=40, height=20)
  doc.addImage(logoBase64, 'PNG', 20, 10, 60, 30);

  doc.setFontSize(14);
  doc.text("CERTIFICATE OF CONFORMANCE", 130, 20, null, null, "center");

  doc.setFontSize(10);
  doc.text(`CofC Number: ${cocNumber}`, 20, 40);
  doc.text(`Product Description: ${product}`, 20, 50);
  doc.text(`Issued By: ${user}`, 20, 60);
  doc.text(`Date Issued: ${date}`, 20, 70);

  // Certification Statement
  doc.setFont(undefined, 'bold');
  doc.text("Certification Statement:", 20, 85);
  doc.setFont(undefined, 'normal');
  doc.text(
    "This certifies that the items listed below have been manufactured and inspected in accordance with the contractual requirements, technical specifications, and applicable quality standards.",
    20, 90, { maxWidth: 170 }
  );

  // Checklist with Batches
  doc.setFont(undefined, 'bold');
  doc.text("Checklist Summary:", 20, 110);
  doc.setFont(undefined, 'normal');


  
  const checklist = [
    missing_heat_treatment ? "❌ Heat Treatment: Missing items" : "✔ Heat Treatment: All Complete",
    missing_ut ? "❌ UT: Missing items" : "✔ UT: All Complete",
    missing_mpi ? "❌ MPI: Missing items" : "✔ MPI: All Complete",
    missing_final_inspection ? "❌ Final Inspection: Missing items" : "✔ Final Inspection: All Complete"
  ];



  checklist.forEach((line, idx) => {
    doc.text(line, 25, 115 + idx * 7);
  });
  
  


  // Calculate starting Y after checklist
  let startY = 120 + checklist.length * 7 + 10;

  // Pallet Items Table
  if (palletItems.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text("Pallet Items:", 20, startY);
    startY += 7;

    // Table header
    doc.setFont(undefined, 'bold');
    doc.text("Shell #", 25, startY);
    doc.text("Cast Code", 70, startY);
    doc.text("Heat Code", 130, startY);
    startY += 5;

    // Horizontal line under header
    doc.line(20, startY, 190, startY);
    startY += 3;

    doc.setFont(undefined, 'normal');
    palletItems.forEach(item => {
      doc.text(item.shell, 25, startY);
      doc.text(item.cast, 70, startY);
      doc.text(item.heat, 130, startY);
      startY += 7;
    });
  }

  // Now place Conformance Statement BELOW the pallet items table (or checklist if no pallet items)
  startY += 10;  // add some space before conformance statement

  doc.setFont(undefined, 'bold');
  doc.text("", 20, startY);
  startY += 6;

  doc.setFont(undefined, 'normal');
  doc.text(
    "",
    20, startY, { maxWidth: 170 }
  );

  // Move startY down to allow for multiline text height (~20-30 units)
  startY += 30;

  // Signature lines
  doc.line(20, startY + 20, 80, startY + 20);
  doc.text("Quality Signature", 20, startY + 25);

  doc.line(120, startY + 20, 180, startY + 20);
  doc.text("Date", 120, startY + 25);

  // Save PDF
  doc.save(`dffdgdf_${cocNumber}.pdf`);
}


window.addEventListener("DOMContentLoaded", () => {
  init();
});














// window.onload = async function () {
//   await fetchCurrentUser();
//   // cofcId = getCofcIdFromURL();
//   // console.log("📄 CofC ID:", cofcId);

// //   if (!cofcId) {
// //     alert("❌ No CofC ID found in the URL.");
// //     return;
// //   }

//   // Optional: load existing CofC details
//   await loadCofcDetails(); //← create this if needed
//   await loadInspectionData();
//   await loadPalletComponents();
// };