declare module 'pdfjs-dist' {
  export * from 'pdfjs-dist/types/display/api';
  
  export const version: string;
  
  export interface GlobalWorkerOptions {
    workerSrc: string | URL | (() => string | URL);
  }
  
  export const GlobalWorkerOptions: GlobalWorkerOptions;
  
  export function getDocument(source: ArrayBuffer | Uint8Array | { data: Uint8Array }): PDFDocumentLoadingTask;
  
  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }
  
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }
  
  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }
  
  export interface TextContent {
    items: TextItem[];
  }
  
  export interface TextItem {
    str: string;
  }
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const workerSrc: string;
  export default workerSrc;
}
