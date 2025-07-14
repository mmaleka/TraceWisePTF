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

}

function searchComponent() {
  const shell = document.getElementById("shellInput").value.trim();
  const cast = document.getElementById("castInput").value.trim();
  const heat = document.getElementById("heatInput").value.trim();

  // Show result container
  document.getElementById("resultContainer").classList.remove("d-none");

  // Dummy data for all stages — replace with real data source or API calls later

  const heatTreatmentData = {
    product: "Shell Casing",
    quantity: 100,
    soft: 10,
    hard: 90,
    records: [
      { user: "j.molefe", date: "2025-07-08", determination: "Accepted", defect: "" },
      { user: "t.sibeko", date: "2025-07-09", determination: "Rework", defect: "Soft hardness" },
    ]
  };

  const ultrasonicTestingData = [
    { user: "j.dlamini", date: "2025-07-10", determination: "Accepted", defect: "" },
    { user: "m.khoza", date: "2025-07-11", determination: "Scrap", defect: "Crack" }
  ];

  const finalStampingData = [
    { user: "s.ngema", date: "2025-07-12", determination: "Accepted", defect: "" },
  ];

  const cncOperationsData = [
    { user: "a.motshekga", date: "2025-07-13", determination: "Accepted", defect: "" },
    { user: "l.mabena", date: "2025-07-14", determination: "Rework", defect: "Dimension off" }
  ];

  const mpiData = [
    { user: "m.sebeko", date: "2025-07-15", determination: "Accepted", defect: "" },
  ];

  const bandingData = [
    { user: "r.phiri", date: "2025-07-16", determination: "Accepted", defect: "" },
  ];

  const balancingData = [
    { user: "c.khosa", date: "2025-07-17", determination: "Accepted", defect: "" },
  ];

  const finalInspectionData = [
    { user: "k.molefe", date: "2025-07-18", determination: "Accepted", defect: "" },
  ];

  const cofCData = [
    { user: "v.dube", date: "2025-07-19", determination: "Completed", defect: "" },
  ];

  // Utility function to fill table by id and data array
  function fillTable(tableBodyId, data) {
    const tbody = document.getElementById(tableBodyId);
    tbody.innerHTML = "";
    data.forEach(row => {
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

  // Populate Heat Treatment special fields
  document.getElementById("htProduct").textContent = heatTreatmentData.product;
  document.getElementById("htQuantity").textContent = heatTreatmentData.quantity;
  document.getElementById("htSoft").textContent = heatTreatmentData.soft;
  document.getElementById("htHard").textContent = heatTreatmentData.hard;
  fillTable("htTableBody", heatTreatmentData.records);

  // Populate other stages tables
  fillTable("utTableBody", ultrasonicTestingData);
  fillTable("fsTableBody", finalStampingData);
  fillTable("cncTableBody", cncOperationsData);
  fillTable("mpiTableBody", mpiData);
  fillTable("bandingTableBody", bandingData);
  fillTable("balancingTableBody", balancingData);
  fillTable("fiTableBody", finalInspectionData);
  fillTable("cocTableBody", cofCData);
}



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

