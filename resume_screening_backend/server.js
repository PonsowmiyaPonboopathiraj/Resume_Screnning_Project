const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const matchResumeRoutes = require('./routes/matchResumeRoutes');
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

// 🟢 Route: Resume Upload
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

// 🟢 Route: Test Resume Parsing
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

// 🟢 Route: JD Input Test
app.post("/api/jd-input", (req, res) => {
  const { jdText } = req.body;
  if (!jdText) {
    return res.status(400).json({ message: "Job description is required." });
  }

  res.status(200).json({ message: "JD received successfully", jd: jdText });
});

// 🟢 Route: Resume Matching (using TF-IDF + Cosine Similarity)
const matchResumesRoute = require("./routes/matchResumeRoutes");
app.use('/api', matchResumeRoutes); 

// Global error handler (should be at the bottom)
app.use((err, req, res, next) => {
  console.error('Error Message:', err.message);  // Log the error message
  console.error('Error Stack:', err.stack);      // Log the error stack trace
  res.status(500).json({ error: 'Something went wrong!' });  // Send a response to the client
});
// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
