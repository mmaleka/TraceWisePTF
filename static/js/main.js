
function loadPage(pageName) {
  const url = `/static/html/${pageName}.html`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Page not found");
      return response.text();
    })
    .then(html => {
      document.getElementById('app').innerHTML = html;
      // import(`/static/js/${pageName}.js`);

      import(`/static/js/${pageName}.js`).then(module => {
        if (typeof module.init === "function") module.init();
      });

      // import(`/static/js/${pageName}.js`).then(module => {
      //   module.init(); // ✅ very important
      // });

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
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});

document.querySelectorAll(".nav-card").forEach(card => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const page = card.getAttribute("data-page");
    if (page) navigateTo(page);
  });
});




// window.addEventListener('DOMContentLoaded', () => {
//   const token = sessionStorage.getItem('authToken');
//   if (token) {
//     loadPage('/static/html/dashboard.html');
//   } else {
//     loadPage('/static/html/login.html');
//   }
// });



