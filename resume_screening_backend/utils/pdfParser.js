const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);
  return data.text;
};

module.exports = extractTextFromPDF;
