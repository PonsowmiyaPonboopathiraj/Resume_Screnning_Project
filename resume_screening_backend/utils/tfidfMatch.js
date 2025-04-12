const natural = require("natural");
const TfIdf = natural.TfIdf;

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

const cosineSimilarityTFIDF = (jdText, resumeTexts) => {
  const tfidf = new TfIdf();
  const results = [];

  tfidf.addDocument(jdText);

  for (let i = 0; i < resumeTexts.length; i++) {
    tfidf.addDocument(resumeTexts[i].text);
  }

  const jdVector = tfidf.listTerms(0).map(term => term.tfidf);

  for (let i = 0; i < resumeTexts.length; i++) {
    const resumeVector = tfidf.listTerms(i + 1).map(term => term.tfidf);

    const length = Math.max(jdVector.length, resumeVector.length);
    const paddedJD = [...jdVector, ...Array(length - jdVector.length).fill(0)];
    const paddedResume = [...resumeVector, ...Array(length - resumeVector.length).fill(0)];

    const similarity = cosineSimilarity(paddedJD, paddedResume);
    const percent = (similarity * 100).toFixed(2);

    if (similarity > 0.1) {
      results.push({
        name: resumeTexts[i].name,
        matchPercentage: `${percent}%`
      });
    }
  }

  return results;
};

module.exports = { cosineSimilarityTFIDF };
