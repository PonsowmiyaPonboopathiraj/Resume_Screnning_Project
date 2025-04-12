const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Resume Schema
const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: String,
  filePath: String,
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

// ✅ Resume Parse Route - moved outside
app.post("/api/test-resume-parse", async (req, res) => {
  const resumePath = req.body.resumePath;

  if (!resumePath) {
    return res.status(400).json({ error: "resumePath is required in request body" });
  }

  try {
    const pdfBuffer = fs.readFileSync(resumePath);
    const data = await pdfParse(pdfBuffer);
    res.json({ extractedText: data.text });
  } catch (err) {
    console.error("Error parsing resume:", err);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

// Resume Upload Route
app.post("/api/resumes/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const newResume = new Resume({
    name: req.body.name,
    email: req.body.email,
    skills: req.body.skills,
    filePath: req.file.path,
  });

  newResume
    .save()
    .then(() => res.status(200).send("Resume uploaded and stored in DB."))
    .catch((err) => res.status(500).send("Error storing resume in DB: " + err));
});

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
