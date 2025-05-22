require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require("fs").promises;
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const upload = multer({ dest: "uploads/" });

// ✅ Email setup using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "vergo.app.help@gmail.com",
    pass: "mnopaizrrgzpdoee"
  }
});

// ✅ Function to send welcome email
function sendWelcomeEmail(toEmail, userName) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Welcome to Vergo!',
    text: `Hello ${userName},\n\nThank you for signing up for Vergo. We're excited to have you onboard!\n\n– The Team`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Email error:', error);
    } else {
      console.log('✅ Welcome email sent:', info.response);
    }
  });
}

// ✅ /signup endpoint to trigger email
app.post("/signup", async (req, res) => {
  const { email, name } = req.body;

  try {
    // Normally you would save the user to a database here.

    // Send welcome email
    sendWelcomeEmail(email, name);

    res.status(200).json({ message: "Signup successful. Welcome email sent." });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ Check for Groq API key
const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error("❌ Error: API Key is missing! Check your .env file.");
  process.exit(1);
} else {
  console.log("✅ API Key Loaded Successfully.");
}

// ✅ /enhance-resume endpoint
app.post("/enhance-resume", async (req, res) => {
  const resumeData = req.body.resume;
  const prompt = `
    Enhance the following resume with a professional tone and improved phrasing. 
    Return *only* the enhanced resume as a valid JSON object matching the original structure, 
    with no additional text, comments, or markdown:
    ${JSON.stringify(resumeData, null, 2)}
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`API Error: ${JSON.stringify(data)}`);
    }

    const enhancedText = data.choices[0].message.content.trim();
    let enhancedResume;
    try {
      enhancedResume = JSON.parse(enhancedText);
    } catch (parseError) {
      console.error("❌ Failed to parse Groq response as JSON:", parseError);
      enhancedResume = { error: "Enhanced resume not in JSON format", raw: enhancedText };
    }

    res.json({ resume: enhancedResume });
  } catch (error) {
    console.error("❌ Error enhancing resume:", error);
    res.status(500).json({ error: "Failed to enhance resume", details: error.message });
  }
});

// ✅ /extract-pdf-text endpoint
app.post("/extract-pdf-text", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const pdfPath = req.file.path;
    const pdfBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    await fs.unlink(pdfPath); // Clean up
    res.json({ text });
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    res.status(500).json({ error: "Failed to extract PDF text", details: error.message });
  }
});

// ✅ Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
