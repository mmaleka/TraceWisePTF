export function init() {


    showSection("productsSection");
    loadProducts();
    loadUsers();
    loadCNC();


}









const backend = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("authToken");

// Section Switching
export function showSection(id) {
  
  document.querySelectorAll(".admin-section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// PRODUCT FORM
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("productName").value;


  const res = await fetch(`${backend}/products/`, {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    body: JSON.stringify({ name })
  });

  if (res.ok) {
    loadProducts();
    e.target.reset();
  } else {
    alert("❌ Failed to add product");
  }
});
window.showSection = showSection;




async function loadProducts() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("⚠️ You must be logged in to view products.");
    return;
  }

  const res = await fetch(`${backend}/products/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    alert("❌ Failed to load products");
    return;
  }

  const data = await res.json();
  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = "";
  data.forEach(p => {
    tbody.innerHTML += `<tr><td>${p.id}</td><td>${p.name}</td></tr>`;
  });
}





// USER FORM
document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const user_type = document.getElementById("userType").value;

  const res = await fetch(`${backend}/accounts/users/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password, user_type })
  });

  if (res.ok) {
    loadUsers();
    e.target.reset();
  } else {
    alert("❌ Failed to add user");
  }
});


async function loadUsers() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("⚠️ You must be logged in to view users.");
    return;
  }

  try {
    const res = await fetch(`${backend}/accounts/users/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      alert("❌ Failed to load users");
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    data.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.username}</td>
          <td>${u.user_type || "N/A"}</td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error loading users:", error);
    alert("❌ Network error while loading users");
  }
}




// RESET FORM
document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("resetUsername").value;
  const new_password = document.getElementById("newPassword").value;

  const res = await fetch(`${backend}/accounts/reset-password/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, new_password })
  });

  if (res.ok) {
    alert("✅ Password reset");
    e.target.reset();
  } else {
    alert("❌ Reset failed");
  }
});

// CNC FORM
document.getElementById("cncForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("cncName").value;
  const operation_number = document.getElementById("operationNumber").value;

  const res = await fetch(`${backend}/cnc_machining/cnc-operations/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, operation_number })
  });

  if (res.ok) {
    loadCNC();
    e.target.reset();
  } else {
    alert("❌ Failed to add operation");
  }
});



async function loadCNC() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("⚠️ Please login first.");
    return;
  }

  try {
    const res = await fetch(`${backend}/cnc_machining/cnc-operations/`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Failed to load CNC operations:", error);
      alert("❌ Could not load CNC operations");
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("cncTableBody");
    tbody.innerHTML = "";

    data.forEach(op => {
      tbody.innerHTML += `<tr><td>${op.name}</td><td>${op.operation_number}</td></tr>`;
    });
  } catch (err) {
    console.error("❌ Network or server error:", err);
    alert("❌ Failed to connect to server.");
  }
}



