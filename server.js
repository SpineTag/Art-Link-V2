const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

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
            to: process.env.CONTACT_RECEIVER || "ujepenete2020@gmail.com",
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

app.get("/data/artworks.json", (req, res) => {
    const artworksFile = path.join(__dirname, "data", "artworks.json");
    if (fs.existsSync(artworksFile)) {
        res.sendFile(artworksFile);
    } else {
        res.json([]);
    }
});

app.post("/submit-artwork", upload.single("artworkImage"), (req, res) => {
    try {
        const { artistName, artistEmail, artistBio, artworkTitle, artworkDescription, artworkCategory, artworkPrice, consent } = req.body;

        if (!artistName || !artistEmail || !artworkTitle || !artworkDescription || !artworkCategory || !req.file || consent !== "on") {
            return res.status(400).json({ success: false, message: "Please fill all required fields, upload an image, and accept consent." });
        }

        const artworkData = {
            id: Date.now().toString(),
            artistName,
            artistEmail,
            artistBio: artistBio || "",
            artworkTitle,
            artworkDescription,
            artworkCategory,
            artworkPrice: artworkPrice ? parseFloat(artworkPrice) : null,
            imagePath: `/uploads/${req.file.filename}`,
            submittedAt: new Date().toISOString(),
            approved: false // Admin approval needed
        };

        // Load existing artworks
        const artworksFile = path.join(__dirname, "data", "artworks.json");
        let artworks = [];
        if (fs.existsSync(artworksFile)) {
            artworks = JSON.parse(fs.readFileSync(artworksFile, "utf8"));
        }

        // Add new artwork
        artworks.push(artworkData);

        // Save back
        if (!fs.existsSync(path.join(__dirname, "data"))) {
            fs.mkdirSync(path.join(__dirname, "data"));
        }
        fs.writeFileSync(artworksFile, JSON.stringify(artworks, null, 2));

        return res.json({ success: true, message: "Artwork submitted successfully. It will be reviewed before being displayed." });
    } catch (error) {
        console.error("Artwork submission error:", error);
        return res.status(500).json({ success: false, message: "Unable to submit artwork right now, please try again later." });
    }
});

// Fallback for client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "home.html"));
});

app.listen(PORT, () => {
    console.log(`Art-Link server running on http://localhost:${PORT}`);
});
