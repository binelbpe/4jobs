export class TokenService {
  private static readonly TOKEN_KEYS = {
    user: {
      access: 'userAccessToken',
      refresh: 'userRefreshToken',
      csrf: 'userCsrfToken'
    },
    recruiter: {
      access: 'recruiterAccessToken',
      refresh: 'recruiterRefreshToken',
      csrf: 'recruiterCsrfToken'
    },
    admin: {
      access: 'adminAccessToken',
      refresh: 'adminRefreshToken',
      csrf: 'adminCsrfToken'
    }
  };

  static getTokens(type: 'user' | 'recruiter' | 'admin') {
    const keys = this.TOKEN_KEYS[type];
    return {
      accessToken: localStorage.getItem(keys.access),
      refreshToken: localStorage.getItem(keys.refresh),
      csrfToken: localStorage.getItem(keys.csrf)
    };
  }

  static setTokens(type: 'user' | 'recruiter' | 'admin', tokens: {
    accessToken: string;
    refreshToken: string;
    csrfToken?: string;
  }) {
    const keys = this.TOKEN_KEYS[type];
    localStorage.setItem(keys.access, tokens.accessToken);
    localStorage.setItem(keys.refresh, tokens.refreshToken);
    if (tokens.csrfToken) {
      localStorage.setItem(keys.csrf, tokens.csrfToken);
    }
  }

  static clearTokens(type: 'user' | 'recruiter' | 'admin') {
    const keys = this.TOKEN_KEYS[type];
    localStorage.removeItem(keys.access);
    localStorage.removeItem(keys.refresh);
    localStorage.removeItem(keys.csrf);
  }

  static clearAllTokens() {
    Object.values(this.TOKEN_KEYS).forEach(keys => {
      Object.values(keys).forEach(key => {
        localStorage.removeItem(key);
      });
    });
  }

  static isAuthenticated(type: 'user' | 'recruiter' | 'admin'): boolean {
    const tokens = this.getTokens(type);
    return !!tokens.accessToken && !!tokens.refreshToken;
  }
} 