const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
