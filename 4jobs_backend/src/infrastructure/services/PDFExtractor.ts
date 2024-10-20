import { injectable } from "inversify";
import { Poppler } from 'node-poppler';

@injectable()
export class PDFExtractor {
  private poppler: Poppler;

  constructor() {
    this.poppler = new Poppler();
  }

  async extractText(buffer: Buffer): Promise<string> {
    try {
      console.log("Starting PDF extraction");
      
      const options = {
        maintainLayout: true,
        quiet: true
      };

      const result = await this.poppler.pdfToText(buffer);
      
      if (typeof result === 'string') {
        console.log(`PDF extraction completed. Text length: ${result.length}`);
        console.log("First 200 characters of extracted text:", result.substring(0, 200));
        return result;
      } else {
        throw new Error("Unexpected result from pdfToText");
      }
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }
}
