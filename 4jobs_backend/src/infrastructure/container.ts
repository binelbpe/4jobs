import 'reflect-metadata';
import { Secret } from 'jsonwebtoken';
import { Container } from 'inversify';
import TYPES from '../types';
import { MongoUserRepository } from './database/mongoose/repositories/MongoUserRepository';
import { MongoRecruiterRepository } from './database/mongoose/repositories/MongoRecruiterRepository';
import { JwtAuthService } from './services/JwtAuthService';
import { OtpService } from './services/OtpService';
import { NodemailerEmailService } from './services/NodemailerEmailService';
import { GoogleAuthService } from './services/GoogleAuthService';
import { LoginAdminUseCase } from '../application/usecases/admin/LoginAdminUseCase';
import { SignupUserUseCase } from '../application/usecases/auth/SignupUserUseCase';
import { RegisterRecruiterUseCase } from '../application/usecases/recruiter/registerRecruiter';
import { LoginRecruiterUseCase } from '../application/usecases/recruiter/LoginRecruiterUseCase';
import { LoginUseCase } from '../application/usecases/auth/LoginUseCase';
import { IRecruiterRepository } from '../domain/interfaces/repositories/IRecruiterRepository';
import { AdminController } from '../presentation/controllers/AdminController'; 
import { RecruiterController } from '../presentation/controllers/RecruiterController';
import { AuthController } from '../presentation/controllers/user/AuthController';
import { GetUserProfileUseCase } from '../application/usecases/auth/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../application/usecases/auth/UpdateUserProfileUseCase';
import { ProfileController } from '../presentation/controllers/user/ProfileController';

const container = new Container();

container.bind(TYPES.IUserRepository).to(MongoUserRepository);
console.log("Binding MongoRecruiterRepository...");
container.bind<IRecruiterRepository>(TYPES.IRecruiterRepository).to(MongoRecruiterRepository);
container.bind(TYPES.IAuthService).to(JwtAuthService);
container.bind<Secret>(TYPES.JwtSecret).toConstantValue(process.env.JWT_SECRET || 'secret_1');
container.bind(TYPES.OtpService).toDynamicValue(() => new OtpService(33 * 1000, container.get(TYPES.NodemailerEmailService)));
container.bind(TYPES.NodemailerEmailService).to(NodemailerEmailService);
container.bind(TYPES.GoogleAuthService).to(GoogleAuthService);
container.bind(TYPES.LoginAdminUseCase).to(LoginAdminUseCase);
container.bind(TYPES.SignupUserUseCase).to(SignupUserUseCase);
container.bind(TYPES.RegisterRecruiterUseCase).to(RegisterRecruiterUseCase);
container.bind(TYPES.LoginRecruiterUseCase).to(LoginRecruiterUseCase);
container.bind(TYPES.LoginUseCase).to(LoginUseCase); 
container.bind<JwtAuthService>(TYPES.JwtAuthService).to(JwtAuthService).inSingletonScope();
container.bind(TYPES.AdminController).to(AdminController);
container.bind<RecruiterController>(TYPES.RecruiterController).to(RecruiterController)
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<GetUserProfileUseCase>(TYPES.GetUserProfileUseCase).to(GetUserProfileUseCase);
container.bind<UpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase);
container.bind<ProfileController>(TYPES.ProfileController).to(ProfileController);

console.log(container);
export { container };


