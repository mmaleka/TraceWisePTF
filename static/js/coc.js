export function init() {

    document.getElementById("downloadExcelBtn").addEventListener("click", () => {
        alert("📄 This will export the coc data in excel.");
    });

    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });


  
    fetchCurrentUser();
    populateProductOptions();
    fetchCofCRecords(); 

    // Handle form submission
    document.getElementById("Form").addEventListener("submit", async function (e) {
      e.preventDefault();

      const order = document.getElementById("order").value;
      const product = document.getElementById("product").value;
      const comments = document.getElementById("comments").value;
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("You must be logged in to submit.");
        return;
      }

      try {
        const response = await fetch("https://tracewiseptf.onrender.com/api/certificate/cofc/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            order: order,
            product: product,
            comments: comments,
            quantity: 0,      // default value
            complete: false   // default value
          })
        });

        if (response.ok) {
          const newCofC = await response.json();
          console.log("✅ CoC saved:", newCofC);
          Records.unshift({
            cocnumber: newCofC.coc_number,
            order: order,
            product: product,
            comments: comments,
            user: currentUser,
            date: new Date(newCofC.date).toLocaleString(),
            quantity: newCofC.quantity,
            complete: newCofC.complete ? "✅" : "❌"
          });
          renderTable();
          this.reset();
          closeFormPanel();
        } else {
          const errorData = await response.json();
          console.error("❌ Failed to save:", errorData);
          alert("Failed to save CoC.");
        }

      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Network error. Please try again.");
      }
    });



}  


function openFormPanel() {
    document.getElementById("FormPanel").classList.add("open");

    // Optional overlay
    const overlay = document.createElement("div");
    overlay.id = "utOverlay";
    overlay.className = "ut-overlay";
    overlay.onclick = closeFormPanel;
    document.body.appendChild(overlay);
}

function closeFormPanel() {
    document.getElementById("FormPanel").classList.remove("open");

    const overlay = document.getElementById("utOverlay");
    if (overlay) overlay.remove();
}





// Simulated session username (replace with real session later)
let currentProduct = "..."; // default on load
let currentUser = "Unknown";
let Records = [];

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
      const select = document.getElementById("product");
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




// const utRecords = []; // Your table data
const TableBody = document.getElementById("TableBody");

async function fetchCofCRecords() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/certificate/cofc/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      const records = await response.json();
      console.log("records: ", records)
      Records.length = 0; // Clear old records

      records.forEach(record => {
        Records.push({
          cocnumber: record.coc_number,
          order: record.order,
          product: typeof record.product === "object" ? record.product.name : record.product, // fallback
          comments: record.comments || "-",
          user: record.user || "Unknown",
          date: new Date(record.date).toLocaleString(),
          quantity: record.quantity,
          complete: record.complete ? "✅" : "❌"
        });
      });

      renderTable();
    } else {
      console.error("❌ Failed to fetch CoC data:", await response.json());
    }

  } catch (err) {
    console.error("❌ Error fetching CoC records:", err);
  }
}






function renderTable() {
  const tbody = document.getElementById("TableBody");
  tbody.innerHTML = "";
  
  if (Records.length === 0) {
    tbody.innerHTML = "<tr><td colspan='10'>No CofC found.</td></tr>";
    return;
  }
  

  Records.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="#?id=${record.cocnumber}" class="nav-card" onclick="navigateTo('coc_detail')">${record.cocnumber}</a></td>
      <td>${record.order}</td>
      <td>${record.product}</td>
      <td>${record.date}</td>
      <td>${record.user}</td>
      <td>${record.quantity}</td>
      <td>${record.complete}</td>
      <td>${record.comments}</td>
    `;
    tbody.appendChild(row);
  });
}







window.addEventListener("DOMContentLoaded", () => {
  init();
});