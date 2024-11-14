import { injectable } from 'inversify';
import { IAuthMiddlewareService } from '../../domain/interfaces/services/IAuthMiddlewareService';
import { JwtAuthService } from './JwtAuthService';
import { UserModel } from '../database/mongoose/models/UserModel';

@injectable()
export class AuthMiddlewareService implements IAuthMiddlewareService {
  private jwtService: JwtAuthService;

  constructor() {
    this.jwtService = new JwtAuthService(process.env.JWT_SECRET!);
  }

  verifyToken(token: string): any {
    return this.jwtService.verifyToken(token);
  }

  async findUserById(id: string): Promise<any> {
    return UserModel.findById(id).lean();
  }

  generateToken(user: any): string {
    return this.jwtService.generateToken(user);
  }
} 