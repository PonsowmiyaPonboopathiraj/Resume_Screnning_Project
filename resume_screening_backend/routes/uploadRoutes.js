const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Resume = require('../models/Resume'); // Assuming you have a Resume model

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Naming the file uniquely
  },
});

const upload = multer({ storage: storage }); // Defining the upload middleware

// POST route for uploading resumes
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Example: Storing file metadata in MongoDB (use your own model and schema)
  const resumeData = {
    name: req.body.name,
    email: req.body.email,
    skills: req.body.skills,
    filePath: req.file.path, // File path of the uploaded file
  };

  // Save to MongoDB (assuming Resume is a model defined in the models folder)
  const newResume = new Resume(resumeData);
  newResume.save()
    .then(() => {
      res.status(200).send('File uploaded and stored successfully.');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error storing metadata in database.');
    });
});

module.exports = router;
