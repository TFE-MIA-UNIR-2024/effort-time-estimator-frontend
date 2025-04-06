
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts text content from a PDF file
 * @param file PDF file to extract text from
 * @returns Promise resolving to the extracted text
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log("Starting PDF text extraction process");
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = "";
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Concatenate the text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
        
      fullText += pageText + "\n\n";
      console.log(`Extracted text from page ${i}`);
    }
    
    console.log("Text extraction completed successfully");
    return fullText.trim();
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
