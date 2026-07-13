const API = "http://localhost:5000";


// ================= REGISTER =================
async function register() {
    try {
        const username = document.getElementById("regUsername").value;
        const password = document.getElementById("regPassword").value;

        if (!username || !password) {
            alert("Fill all fields");
            return;
        }

        const res = await fetch(API + "/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Register failed");
            return;
        }

        alert("Registered successfully!");

        // redirect to login page
        window.location.href = "index.html";

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}


// ================= LOGIN =================
async function login() {
    try {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Fill all fields");
            return;
        }

        const res = await fetch(API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);

        alert("Login successful!");

        window.location.href = "dashboard.html";

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}