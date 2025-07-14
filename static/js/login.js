document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("access_token");
  const username = sessionStorage.getItem("username"); // assuming you save this after login
  const navbarUser = document.getElementById("navbarUser");

  if (token && username) {
    navbarUser.textContent = `Welcome, ${username}`;
  } else {
    navbarUser.innerHTML = `<a href="/login/" class="text-white text-decoration-none">Sign In</a>`;
  }
});
