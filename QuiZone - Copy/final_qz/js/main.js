document.addEventListener("DOMContentLoaded", function () {

    // Get Navigation Elements
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.querySelector(".nav-links");

    // Mobile Navigation Menu
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }

    // Get Logged-in User
    const user = JSON.parse(localStorage.getItem("quizoraUser"));

    if (!navLinks || !user) return;

    // Profile Menu
    navLinks.innerHTML += `
        <li class="profile-menu">
            <button class="profile-btn" id="profileBtn">
                👤 ${user.name.split(" ")[0]} ▼
            </button>

            <div class="profile-dropdown" id="profileDropdown">
                <p>${user.name}</p>
                <button id="logoutBtn">Logout</button>
            </div>
        </li>
    `;

    // Profile Dropdown
    const profileBtn = document.getElementById("profileBtn");
    const dropdown = document.getElementById("profileDropdown");

    profileBtn.addEventListener("click", function () {
        dropdown.classList.toggle("show");
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("quizoraUser");
        window.location.href = "index.html";
    });

});