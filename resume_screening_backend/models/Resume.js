const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: String,
  filePath: String,
});

// ✅ Fix for OverwriteModelError
const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

module.exports = Resume;
