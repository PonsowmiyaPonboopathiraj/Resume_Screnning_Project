const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer"); // Add multer import

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Naming the file uniquely
  },
});

const upload = multer({ storage: storage }); // Defining the upload middleware

// Define Resume Schema
const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: String,
  filePath: String,
});

// Prevent Overwriting Model
const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to the Resume Screening API! 🚀");
});

// Upload route for resumes
app.post("/api/resumes/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Store resume metadata in MongoDB
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

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
