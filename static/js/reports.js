export function init() {

    document.getElementById("filterCofCReportBtn").addEventListener("click", () => {
        filterCofCReport()
    });
    document.getElementById("searchComponentBtn").addEventListener("click", () => {
        searchComponent()
    });
    document.getElementById("filterByOperationBtn").addEventListener("click", () => {
        filterByOperation()
    });
    document.getElementById("fetchWipSummaryBtn").addEventListener("click", () => {
        fetchWipSummary()
    });

}




let currentUser = "Unknown";
const token = localStorage.getItem("authToken");

// Fetch current user info
async function fetchCurrentUser() {
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







export function searchComponent() {
  const shell = document.getElementById("shellInput").value.trim();
  const cast = document.getElementById("castInput").value.trim();
  const heat = document.getElementById("heatInput").value.trim();

  if (!shell || !cast || !heat) {
    alert("Please enter all fields: Shell, Cast, and Heat.");
    return;
  }

  // Show result container
  document.getElementById("resultContainer").classList.remove("d-none");
  
  
  fetch(`https://tracewiseptf.onrender.com/api/reports/traceability/?shell=${shell}&cast=${cast}&heat=${heat}`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch traceability data.");
    return response.json();
  })
  .then(data => {

  // fetch(`https://tracewiseptf.onrender.com/api/component-traceability/?shell=${shell}&cast=${cast}&heat=${heat}`)
  //   .then((response) => {
  //     if (!response.ok) throw new Error("Failed to fetch data.");
  //     return response.json();
  //   })
  //   .then((data) => {
  //     // Heat Treatment
      document.getElementById("htProduct").textContent = data.heat_treatment.product || "-";
      document.getElementById("htQuantity").textContent = data.heat_treatment.quantity || "0";
      document.getElementById("htSoft").textContent = data.heat_treatment.soft || "0";
      document.getElementById("htHard").textContent = data.heat_treatment.hard || "0";
      fillTable("htTableBody", data.heat_treatment.records || []);

      // Other sections
      fillTable("utTableBody", data.ultrasonic_testing || []);
      fillTable("fsTableBody", data.final_stamping || []);
      fillTable("cncTableBody", data.cnc_machining || []);
      fillTable("mpiTableBody", data.mpi || []);
      fillTable("bandingTableBody", data.banding || []);
      fillTable("balancingTableBody", data.balancing || []);
      fillTable("fiTableBody", data.final_inspection || []);
      fillTable("cocTableBody", data.certificate_of_conformance || []);
    })
    .catch((error) => {
      alert("Error loading component data. Please try again.");
      console.error(error);
    });
}

// Helper function (unchanged)
function fillTable(tableBodyId, data) {
  const tbody = document.getElementById(tableBodyId);
  tbody.innerHTML = "";
  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.user}</td>
      <td>${row.date}</td>
      <td>${row.determination}</td>
      <td>${row.defect || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}
window.searchComponent = searchComponent;




function filterByOperation() {
  const operation = document.getElementById("operationSelect").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const tbody = document.getElementById("operationTableBody");
  tbody.innerHTML = ""; // Clear previous results

  if (!operation || !start || !end) {
    alert("Please select an operation and date range.");
    return;
  }

  // Sample data structure
  const allData = {
    "Heat Treatment": [
      { shell: "SN001", cast: "CC100", heat: "HC200", user: "john", date: "2025-07-05", determination: "Pass", defect: "" },
      { shell: "SN002", cast: "CC101", heat: "HC201", user: "sara", date: "2025-07-10", determination: "Scrap", defect: "Overheated" }
    ],
    "MPI": [
      { shell: "SN003", cast: "CC102", heat: "HC202", user: "mike", date: "2025-07-08", determination: "Rework", defect: "Crack" }
    ]
    // Add for other operations...
  };

  const filtered = (allData[operation] || []).filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= new Date(start) && itemDate <= new Date(end);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">No data found for the selected filters.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const row = `<tr>
      <td>${item.shell}</td>
      <td>${item.cast}</td>
      <td>${item.heat}</td>
      <td>${item.user}</td>
      <td>${item.date}</td>
      <td>${item.determination}</td>
      <td>${item.defect}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}




function filterCofCReport() {
  const cocNum = document.getElementById("cocNumberInput").value.trim().toLowerCase();
  const product = document.getElementById("productInput").value.trim().toLowerCase();
  const user = document.getElementById("userInput").value.trim().toLowerCase();
  const startDate = document.getElementById("startDateCofC").value;
  const endDate = document.getElementById("endDateCofC").value;
  const onlyIncomplete = document.getElementById("incompleteCheckbox").checked;

  const tbody = document.getElementById("cocReportTableBody");
  tbody.innerHTML = ""; // Clear previous results

  const Records = [
    {
      cocnumber: "COFC-2025001",
      product: "Pump Housing",
      user: "Lulu Nkosi",
      date: "2025-07-01",
      quantity: 12,
      complete: "✔",
      comments: "Passed all tests",
      components: [
        { shell: "SH-001", cast: "AA01", heat: "HT01" },
        { shell: "SH-002", cast: "AA01", heat: "HT01" },
        { shell: "SH-003", cast: "AA01", heat: "HT01" }
      ],
      missing: {
        heat_treatment: ["SH-001-AA01-HT01"],
        UT: "All Complete",
        MPI: "All Complete",
        Balancing: ["SH-003-AA01-HT01"],
        final_inspection: "All Complete"
      }
    },
    {
      cocnumber: "COFC-2025002",
      product: "Valve Body",
      user: "John Dee",
      date: "2025-07-05",
      quantity: 20,
      complete: "✖",
      comments: "Final inspection pending",
      components: [
        { shell: "VB-010", cast: "AB02", heat: "HT04" },
        { shell: "VB-011", cast: "AB02", heat: "HT04" }
      ],
      missing: {
        heat_treatment: "All Complete",
        UT: ["VB-010-AB02-HT04", "VB-011-AB02-HT04"],
        MPI: ["VB-011-AB02-HT04"],
        Balancing: "All Complete",
        final_inspection: "All Complete"
      }
    }
  ];

  Records.forEach((record, index) => {
    const recordDate = new Date(record.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matches = (!cocNum || record.cocnumber.toLowerCase().includes(cocNum)) &&
                    (!product || record.product.toLowerCase().includes(product)) &&
                    (!user || record.user.toLowerCase().includes(user)) &&
                    (!start || recordDate >= start) &&
                    (!end || recordDate <= end) &&
                    (!onlyIncomplete || record.complete !== "✔");

    if (matches) {
      const row = document.createElement("tr");

      // Generate components list
      let componentsHtml = "<ul class='mb-0'>";
      record.components.forEach(comp => {
        componentsHtml += `<li>Shell: <strong>${comp.shell}</strong>, Cast: ${comp.cast}, Heat: ${comp.heat}</li>`;
      });
      componentsHtml += "</ul>";

      // Incomplete Components Section (collapsible)
      const collapseId = `collapse-${index}`;
      const hasMissing = hasIncompleteData(record.missing);
      let incompleteSection = "";

      if (hasMissing) {
        const rows = generateMissingRows(record.missing);
        incompleteSection = `
          <div class="mt-3">
            <button class="btn btn-outline-danger btn-sm" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
              ⚠️ View Incomplete Components
            </button>
            <div class="collapse mt-2" id="${collapseId}">
              <div class="table-responsive">
                <table class="table table-bordered table-warning">
                  <thead class="table-light">
                    <tr>
                      <th>MIssing Operations</th>
                      <th>Shell-Cast-Heat</th>
                    </tr>
                  </thead>
                  <tbody>${rows.join("")}</tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      }

      row.innerHTML = `
        <td>${record.cocnumber}</td>
        <td>${record.product}</td>
        <td>${record.user}</td>
        <td>${record.date}</td>
        <td>${record.quantity}</td>
        <td>${record.complete}</td>
        <td>${record.comments}</td>
        <td>
          ${componentsHtml}
          ${incompleteSection}
        </td>
      `;

      tbody.appendChild(row);
    }
  });
}


function hasIncompleteData(missing) {
  return Object.values(missing).some(
    value => Array.isArray(value) && value.length > 0
  );
}



function generateMissingRows(missingData) {
  const rows = [];

  for (const [stage, components] of Object.entries(missingData)) {
    if (components === "All Complete") continue;

    const componentList = components.map(id => `<code>${id}</code>`).join(", ");
    rows.push(`
      <tr>
        <td><strong>${stage.replace(/_/g, " ").toUpperCase()}</strong></td>
        <td>${componentList}</td>
      </tr>
    `);
  }

  return rows;
}


function fetchWipSummary() {
   
  const productId = document.getElementById("wipProductInput").value.trim();
  const tbody = document.getElementById("wipSummaryTableBody");
  tbody.innerHTML = "";

  if (!productId) {
    alert("Please enter a product ID.");
    return;
  }

  fetch(`https://tracewiseptf.onrender.com/api/reports/wip-summary/?product=${productId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    credentials: "include" // Needed if you're using session auth
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch WIP summary");
      return response.json();
    })
    .then(data => {
      for (const [operation, count] of Object.entries(data)) {
        const row = `<tr>
          <td>${operation}</td>
          <td>${count}</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    })
    .catch(error => {
      console.error("Error fetching WIP summary:", error);
      tbody.innerHTML = `<tr><td colspan="2" class="text-danger">Error loading data</td></tr>`;
    });
}


















