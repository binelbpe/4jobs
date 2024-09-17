import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { IAuthService } from '../../core/interfaces/services/IAuthService';
import { User } from '../../core/entities/User';

export class JwtAuthService implements IAuthService {
  private readonly JWT_SECRET: Secret;

  constructor(jwtSecret: Secret) {
    this.JWT_SECRET = jwtSecret;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: '1d' }
    );
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET);
  }
}