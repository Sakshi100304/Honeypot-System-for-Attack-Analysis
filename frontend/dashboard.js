const API = "http://localhost:5000";

async function loadLogs() {
    try {
        const res = await fetch(API + "/logs");

        if (!res.ok) {
            document.getElementById("stats").innerHTML = "Failed to load logs";
            return;
        }

        const data = await res.json();

        if (!data.length) {
            document.getElementById("stats").innerHTML = "<p>No logs found</p>";
            return;
        }

        let html = `
            <h2>📊 Attack Logs</h2>
            <table border="1" cellpadding="10">
                <tr>
                    <th>Username</th>
                    <th>IP</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Time</th>
                </tr>
        `;

        data.forEach(log => {
            html += `
                <tr>
                    <td>${log.username}</td>
                    <td>${log.ip}</td>
                    <td>${log.city}</td>
                    <td>${log.country}</td>
                    <td>${new Date(log.time).toLocaleString()}</td>
                </tr>
            `;
        });

        html += "</table>";

        document.getElementById("stats").innerHTML = html;

    } catch (err) {
        console.error(err);
        document.getElementById("stats").innerHTML = "Error loading data";
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

loadLogs();