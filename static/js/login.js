// let currentUser = "Unknown";

// Fetch current user info
async function fetchCurrentUser() {
  const token = localStorage.getItem("authToken");
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

// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");
  const successDiv = document.getElementById("success");

  // Clear previous messages
  errorDiv.textContent = "";
  successDiv.textContent = "";

  if (!username || !password) {
    errorDiv.textContent = "❗ Both fields are required.";
    return;
  }

  const button = this.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Logging in...";

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error("❌ Server returned invalid response.");
    }

    if (response.ok) {
      const accessToken = data.access;
      localStorage.setItem("authToken", accessToken);

      // Fetch user details
      const whoamiRes = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!whoamiRes.ok) throw new Error("🔒 Failed to fetch user info.");

      const user = await whoamiRes.json();
      successDiv.textContent = `✅ Welcome, ${user.username} ${user.last_name}`;
      localStorage.setItem("username", user.username);

      updateNavbar(); // ✅ Refresh navbar after login
      navigateTo('dashboard')
    } else {
      errorDiv.textContent =
        data.non_field_errors?.[0] || data.detail || "❌ Login failed. Please try again.";
    }
  } catch (err) {
    console.error("Login error:", err);
    errorDiv.textContent = err.message.includes("Failed to fetch")
      ? "🚫 Unable to reach server. Is it running?"
      : err.message;
  } finally {
    button.disabled = false;
    button.textContent = "Login";
  }
});

// Update navbar based on auth status
function updateNavbar() {
  const navLinks = document.getElementById("navLinks");
  navLinks.innerHTML = "";

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");

  if (token && username) {
    navLinks.innerHTML = `
      <li><span style="color:#ccc">👤 ${username}</span></li>
      <li><a href="#" onclick="signOut()">Sign Out</a></li>
      <li><a href="#admin">Admin</a></li>
      <li><a href="#contact">Contact</a></li>
    `;
  } else {
    navLinks.innerHTML = `
      <li><a href="#login">Sign In</a></li>
      <li><a href="#contact">Contact</a></li>
    `;
  }
}

// Sign out and clear user info
function signOut() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  updateNavbar();
  alert("✅ You have been signed out");
  navigateTo('login')
}

// Call on load
window.addEventListener("load", updateNavbar);

window.onload = async function () {
  await fetchCurrentUser();
};
