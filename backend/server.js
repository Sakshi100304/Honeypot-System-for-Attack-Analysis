const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// ================= PORT =================
const PORT = process.env.PORT || 5000;
// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMAS =================
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const logSchema = new mongoose.Schema({
    username: String,
    ip: String,
    city: String,
    country: String,
    attackType: String,
    time: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Log = mongoose.model("Log", logSchema);

// ================= REGISTER =================
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Fill all fields" });
        }

        const exists = await User.findOne({ username });

        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        await User.create({ username, password });

        res.json({ message: "Registered successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Fill all fields" });
        }

        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // ================= ATTACK DETECTION =================
        let attackType = "Normal";

        if (
            username.includes("'") ||
            username.includes("--") ||
            username.toLowerCase().includes("select")
        ) {
            attackType = "SQL Injection";
        }
        else if (
            username.includes("<script>") ||
            username.includes("</")
        ) {
            attackType = "XSS Attack";
        }
        else if (password.length < 4) {
            attackType = "Brute Force Attempt";
        }

        // ================= IP DETECTION =================
        let ip =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "";

        if (ip.includes(",")) {
            ip = ip.split(",")[0];
        }

        if (ip.startsWith("::ffff:")) {
            ip = ip.replace("::ffff:", "");
        }

        // FOR LOCAL TESTING
        if (ip === "::1" || ip === "127.0.0.1") {
            ip = "8.8.8.8";
        }

        // ================= GEO LOCATION API =================
        let geo = {};

        try {
            const axios = require("axios");

            const response = await axios.get(`https://ipapi.co/${ip}/json/`);
             geo = response.data;
        } catch (err) {
            console.log("Geo error:", err);
        }

        // ================= SAVE LOG =================
        await Log.create({
            username,
            ip,
            city: geo.city || "Unknown",
            country: geo.country_name || "Unknown",
            attackType
        });

        // ================= RESPONSE =================
        res.json({
            token: "dummy-token",
            username,
            ip,
            city: geo.city || "Unknown",
            country: geo.country_name || "Unknown",
            attackType
        });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ================= GET LOGS =================
app.get("/logs", async (req, res) => {
    try {
        const logs = await Log.find().sort({ time: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching logs" });
    }
});

app.get("/", (req, res) => {
    res.send("Honeypot Backend Running Successfully 🚀");
});

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
