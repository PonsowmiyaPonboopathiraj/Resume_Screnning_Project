const fs = require("fs");
const pdfParse = require("pdf-parse");
const Resume = require("../models/Resume"); // Adjust path if needed
const natural = require("natural");
const TfIdf = natural.TfIdf;

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const matchResumesWithJD = async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription) {
    return res.status(400).json({ error: "Job description is required" });
  }

  try {
    const resumes = await Resume.find({});
    const tfidf = new TfIdf();
    const results = [];

    // Add JD first once
    tfidf.addDocument(jobDescription);
    const jdVector = tfidf.listTerms(0).map(t => t.tfidf);

    for (const resume of resumes) {
      const buffer = fs.readFileSync(resume.filePath);
      const parsed = await pdfParse(buffer);
      const resumeText = parsed.text;

      tfidf.addDocument(resumeText);
      const resumeVector = tfidf.listTerms(1).map(t => t.tfidf);

      const length = Math.max(jdVector.length, resumeVector.length);
      const paddedJD = [...jdVector, ...Array(length - jdVector.length).fill(0)];
      const paddedResume = [...resumeVector, ...Array(length - resumeVector.length).fill(0)];

      const similarity = cosineSimilarity(paddedJD, paddedResume);
      const percent = (similarity * 100).toFixed(2);

      if (similarity > 0.1) {
        results.push({
          name: resume.name,
          matchPercentage: `${percent}%`,
        });
      }

      tfidf.documents.pop(); // remove resume for next loop
    }

    return res.json({ matchingResumes: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error during resume matching" });
  }
};

module.exports = { matchResumesWithJD };
