declare module 'node-poppler' {
  export class Poppler {
    pdfToText(input: Buffer | string, options?: PdfToTextOptions): Promise<string>;
  }

  interface PdfToTextOptions {
    maintainLayout?: boolean;
    quiet?: boolean;
    [key: string]: any;
  }
}
