console.log("dashboard 2");

// document.addEventListener("DOMContentLoaded", function () {
//   const token = sessionStorage.getItem("access_token");
//   const username = sessionStorage.getItem("username"); // assuming you save this after login
//   const navbarUser = document.getElementById("navbarUser");

//   if (token && username) {
//     navbarUser.textContent = `Welcome, ${username}`;
//   } else {
//     navbarUser.innerHTML = `<a href="#" onclick="navigateTo('dashboard')" class="text-white text-decoration-none">Sign In</a>`;
//   }
// });


const token = localStorage.getItem("authToken");
  if (!token) {
    navigateTo("login");
  }



let currentUser = "Unknown";

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



// Update navbar based on auth status
async function updateNavbar() {
  const navLinks = document.getElementById("navLinks");
  navLinks.innerHTML = "";

  const token = localStorage.getItem("authToken");
  const username = localStorage.getItem("username");

  if (token && username) {
    navLinks.innerHTML = `

      <li class="nav-item">
        <a class="nav-link disabled text-light" href="#">👤 ${username}</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="signOut()">Sign Out</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="navigateTo('admin')">Admin</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Contact</a>
      </li>


    `;
  } else {
    navLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="navigateTo('login')">Sign In</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Contact</a>
      </li>
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





//////////
//NEW JS CODE HEH
//////////
document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("authToken");
  console.log("token...: ", token)

  if (!token) {
    // Token missing = not logged in → redirect to login page
    navigateTo('login')
    return;
  }

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const user = await res.json();
    const welcomeEl = document.getElementById("adminWelcome");

    if (welcomeEl) {
      welcomeEl.textContent = `👋 ${user.username}, welcome to the Traceability System`;
    }

    // You can also check roles or add conditional logic here
    console.log("User Info:", user);
  } catch (err) {
    console.error("Dashboard error:", err);
    navigateTo('login')
  }
});




window.onload = async function () {
  await fetchCurrentUser();
  await updateNavbar();
};