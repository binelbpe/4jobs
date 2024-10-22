import { injectable,inject  } from 'inversify'; 
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { IAuthService } from '../../domain/interfaces/services/IAuthService';
import { User } from '../../domain/entities/User';
import TYPES  from '../../types';

@injectable()
export class JwtAuthService implements IAuthService {
  private readonly JWT_SECRET: Secret;

  constructor(
    @inject(TYPES.JwtSecret) jwtSecret: Secret
  ) {
    this.JWT_SECRET = jwtSecret;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,  
    },
    this.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Add a method to generate refresh token
generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    this.JWT_SECRET,
    { expiresIn: '7d' } // Longer expiration for refresh token
  );
}

  verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET);
  }
}
