import { injectable } from 'inversify';
import { IXssService } from '../../domain/interfaces/services/IXssService';
import xss from 'xss';

@injectable()
export class XssService implements IXssService {
  private options = {
    whiteList: {}, // Disallow all HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'frame', 'object', 'embed']
  };

  sanitize(value: any): any {
    if (typeof value === 'string') {
      return xss(value, this.options);
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitize(item));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).reduce((acc: any, key) => {
        acc[key] = this.sanitize(value[key]);
        return acc;
      }, {});
    }

    return value;
  }

  getOptions(): any {
    return this.options;
  }
} 