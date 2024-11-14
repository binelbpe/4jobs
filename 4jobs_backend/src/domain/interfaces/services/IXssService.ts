export interface IXssService {
  sanitize(value: any): any;
  getOptions(): any;
} 