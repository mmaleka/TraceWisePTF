function loadPage(pageName) {
  const version = Date.now(); // or use a static version like 'v=1.0.3'
  const htmlUrl = `/static/html/${pageName}.html?v=${version}`;
  const jsUrl = `/static/js/${pageName}.js?v=${version}`;

  fetch(htmlUrl)
    .then(response => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then(html => {
      document.getElementById('app').innerHTML = html;

      import(jsUrl).then(module => {
        if (typeof module.init === "function") module.init();
      });

    })
    .catch(err => {
      document.getElementById('app').innerHTML = `<div class="alert alert-danger">Could not load page: ${pageName}</div>`;
      console.error(err);
    });
}


function navigateTo(page) {
  loadPage(page);
}

// Load default page
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("🔐 No token found. Redirecting to login.");
    navigateTo('login');
    return;
  }

  try {
    const res = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const user = await res.json();
    localStorage.setItem("username", user.username);
    console.log("✅ Logged in as", user.username);

    navigateTo('dashboard');

  } catch (err) {
    console.error("❌ Auth failed:", err);
    navigateTo('login');
  }
});


document.querySelectorAll(".nav-card").forEach(card => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const page = card.getAttribute("data-page");
    if (page) navigateTo(page);
  });
});



