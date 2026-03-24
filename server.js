const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS support for API clients (optional; same origin for local hosting)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Email transporter config (set via env vars)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER || "username",
        pass: process.env.SMTP_PASS || "password"
    }
});

app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, subject, message, consent } = req.body;

        if (!name || !email || !message || consent !== "on") {
            return res.status(400).json({ success: false, message: "Please fill all required fields and accept consent." });
        }

        const mailOptions = {
            from: `\"Art Link Contact Form\" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER || "epenete.ujeneza@ebkrw.org",
            subject: subject || "New message from Art Link website",
            text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "(none)"}\nMessage:\n${message}`,
            html: `<p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Subject:</strong> ${subject || "(none)"}</p>
                   <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Message sent successfully." });
    } catch (error) {
        console.error("Contact API error:", error);
        return res.status(500).json({ success: false, message: "Unable to send message right now, please try again later." });
    }
});

// Fallback for client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "home.html"));
});

app.listen(PORT, () => {
    console.log(`Art-Link server running on http://localhost:${PORT}`);
});
