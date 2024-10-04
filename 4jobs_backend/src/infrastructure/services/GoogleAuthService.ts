import { injectable } from 'inversify'; 
import { OAuth2Client } from 'google-auth-library';

@injectable() 
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');
  }

  async verifyToken(tokenId: string | undefined) {
    if (!tokenId) {
      throw new Error('ID Token is required');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      });
      const payload = ticket.getPayload();
      console.log('Payload:', payload);
      return payload;
    } catch (error) {
      console.error('Error verifying ID Token:', error);
      throw new Error('Invalid ID Token');
    }
  }
}
