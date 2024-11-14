import { injectable } from "inversify";
import pdf from 'pdf-parse';

@injectable()
export class PDFExtractor {
  constructor() {}

  async extractText(buffer: Buffer): Promise<string> {
    try {
      console.log("Starting PDF extraction");
      
      const data = await pdf(buffer);
      const text = data.text;
      
      return text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }
}