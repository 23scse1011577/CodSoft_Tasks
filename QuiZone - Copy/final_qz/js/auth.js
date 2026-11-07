// REGISTER FUNCTION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                message.style.color = "red";
            }

        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
        }
    });
}


// LOGIN FUNCTION
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {
                message.style.color = "green";

                localStorage.setItem("quizoraUser", JSON.stringify(data.user));

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);

            } else {
                message.style.color = "red";
            }

        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
        }
    });
}