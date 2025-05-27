const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Multer setup to handle file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Parse JSON bodies
app.use(bodyParser.json());

// POST route to handle form with file upload named "resume"
app.post("/apply", upload.single("resume"), async (req, res) => {
  const { name, email, message } = req.body;
  const resumeFile = req.file; // multer puts uploaded file here

  if (!resumeFile) {
    return res.status(400).send("Resume file is required");
  }

  // Set up nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Send mail with attachment
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: New Application from ${name},
      text: message || "No message provided",
      attachments: [
        {
          filename: resumeFile.originalname,
          content: resumeFile.buffer,
        },
      ],
    });

    res.status(200).send("Application received!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

// Listen on port from env or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ${PORT}');
});
