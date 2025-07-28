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
    // If token is expired or invalid, log out the user
    // localStorage.removeItem("authToken");
    // window.location.href = "login.html";
  }
});

