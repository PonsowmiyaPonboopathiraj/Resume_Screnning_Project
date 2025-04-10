const multer = require("multer");
const express = require("express");
const router = express.Router();
const PDF = require("../models/Resume");

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload PDF Route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
      const newPDF = new PDF({
          name: req.file.originalname,
          filePath: req.file.path,
      });
      await newPDF.save();
      res.json({ message: "PDF uploaded successfully", data: newPDF });
  } catch (err) {
      res.status(500).json({ error: "Failed to upload PDF" });
  }
});

// Add route for uploading resume
app.post("/api/resumes/upload", upload.single("file"), (req, res) => {
  const { name, email, skills } = req.body;

  // Check if the file and metadata are provided
  if (!req.file || !name || !email || !skills) {
    return res.status(400).json({ message: "Please provide a file and metadata!" });
  }

  // Here, you can save this data to your MongoDB database
  const resumeData = {
    name: name,
    email: email,
    skills: skills.split(","), // Convert comma-separated skills to an array
    filePath: req.file.path,
  };

  // Example: Saving the data in MongoDB (Assuming you have a Resume model)
  // const newResume = new Resume(resumeData);
  // newResume.save()
  //   .then(() => res.status(200).json({ message: "File uploaded successfully!" }))
  //   .catch((err) => res.status(500).json({ message: "Error saving resume!" }));

  // For now, just sending a success response with file path
  res.status(200).json({
    message: "File uploaded successfully!",
    filePath: req.file.path,
    metadata: resumeData,
  });
});
module.exports = router;
