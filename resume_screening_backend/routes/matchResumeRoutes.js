// routes/matchResumeRoutes.js
const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const natural = require("natural");
const TfIdf = natural.TfIdf;
const { matchResumesWithJD} = require("../controllers/matchResumesController");

router.post("/match-resumes", matchResumesWithJD);
// Cosine similarity calculation
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

router.post("/match-resumes", async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    const resumes = await Resume.find();
    const tfidf = new TfIdf();
    const results = [];

    tfidf.addDocument(jobDescription); // JD is first document

    const resumeData = [];

    // Add resume texts to TF-IDF
    for (const resume of resumes) {
      const buffer = fs.readFileSync(resume.filePath);
      const parsed = await pdfParse(buffer);
      tfidf.addDocument(parsed.text);
      resumeData.push({ name: resume.name });
    }

    const jdVector = tfidf.listTerms(0).map(term => term.tfidf);

    for (let i = 0; i < resumeData.length; i++) {
      const resumeVector = tfidf.listTerms(i + 1).map(term => term.tfidf);

      // Padding
      const length = Math.max(jdVector.length, resumeVector.length);
      const paddedJD = [...jdVector, ...Array(length - jdVector.length).fill(0)];
      const paddedResume = [...resumeVector, ...Array(length - resumeVector.length).fill(0)];

      const similarity = cosineSimilarity(paddedJD, paddedResume);
      const percent = (similarity * 100).toFixed(2);

      if (similarity > 0.1) {
        results.push({
          name: resumeData[i].name,
          matchPercentage: `${percent}%`
        });
      }
    }

    res.json({ matchedResumes: results });
  } catch (err) {
    console.error("Error during resume matching:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
