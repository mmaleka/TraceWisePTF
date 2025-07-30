
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

    document.getElementById("castCode").addEventListener("input", triggerProductLookup);
    document.getElementById("heatCode").addEventListener("input", triggerProductLookup);


    


    // const utRecords = []; // Your table data
    const utTableBody = document.getElementById("utTableBody");
    document.getElementById("Product").value = "...";
    fetchUltrasonicRecords();

    

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", async  function (e) {
    e.preventDefault();

    const serial = document.getElementById("serialNumber").value;
    const cast_code = document.getElementById("castCode").value;
    const heat_code = document.getElementById("heatCode").value;
    const operation_type = "MPI"
    const sentence = document.getElementById("sentence").value;
    const comment = document.getElementById("comment").value;
    const date = new Date().toLocaleDateString();


    try {
        const response = await fetch("https://tracewiseptf.onrender.com/api/ultrasonic/records/?operation_type=MPI", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            serial,
            cast_code: cast_code,
            heat_code: heat_code,
            operation_type,
            sentence,
            comment
        })
        });

        const data = await response.json();
        console.log("MPI data: ", data);
        

        if (!response.ok) {
        throw new Error(data.detail || Object.values(data).join(" "));
        }


        renderUTTable();
        document.getElementById("utMessage").textContent = `✅ Result saved for ${serial}`;
        document.getElementById("utMessage").style.color = "#28a745";
        document.getElementById("utForm").reset();
        setTimeout(closeFormPanel, 1000);

    } catch (err) {
        console.error("UT Form Error:", err);
        document.getElementById("utMessage").textContent = `❌ ${err.message}`;
        document.getElementById("utMessage").style.color = "#e63946";
    }



    utRecords.unshift({ serial, cast_code, heat_code, Product, operation_type, sentence, comment, date });

    

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



const utRecords = [];

async function fetchUltrasonicRecords() {
    
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/ultrasonic/records/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch records.");
    }

    utRecords.splice(0, utRecords.length, ...data); // replace content
    renderUTTable();
  } catch (err) {
    console.error("Error fetching UT records:", err);
  }
}


function renderUTTable() {
  const utTableBody = document.getElementById("utTableBody");
  utTableBody.innerHTML = "";

  if (utRecords.length === 0) {
      utTableBody.innerHTML = "<tr><td colspan='9'>No batches found.</td></tr>";
      return;
  }

  utRecords.forEach((record, index) => {
    utTableBody.innerHTML += `
      <tr>
        <td>${record.serial}</td>
        <td>${record.cast_code}</td>
        <td>${record.heat_code}</td>
        <td>${record.product_name}</td> 
        <td>${record.operation_type}</td>
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




export function triggerProductLookup() {
    console.log("sdfdg");
    
  const cast_code = document.getElementById("castCode").value.trim();
  const heat_code = document.getElementById("heatCode").value.trim();

  if (cast_code && heat_code) {
    fetchProductFromHeatTreatment(cast_code, heat_code);
  }
}
window.triggerProductLookup = triggerProductLookup;


async function fetchProductFromHeatTreatment(castCode, heatCode) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`https://tracewiseptf.onrender.com/api/heat-treatment/lookup/?cast_code=${encodeURIComponent(castCode)}&heat_code=${encodeURIComponent(heatCode)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("Failed to fetch product");

    const data = await response.json();
    if (data.product) {
      document.getElementById("Product").value = data.product;
    } else {
      document.getElementById("Product").value = "";
    }
  } catch (err) {
    console.error("Error looking up product:", err);
    document.getElementById("Product").value = "";
  }
}



