import "reflect-metadata";
import { Secret } from "jsonwebtoken";
import { Container } from "inversify";
import TYPES from "../types";
import { MongoUserRepository } from "./database/mongoose/repositories/MongoUserRepository";
import { MongoRecruiterRepository } from "./database/mongoose/repositories/MongoRecruiterRepository";
import { MongoAdminRepository } from "./database/mongoose/repositories/MongoAdminRepository";
import { MongoJobPostUserRepository } from "./database/mongoose/repositories/MongoJobPostUserRepository";
import { JwtAuthService } from "./services/JwtAuthService";
import { OtpService } from "./services/OtpService";
import { NodemailerEmailService } from "./services/NodemailerEmailService";
import { GoogleAuthService } from "./services/GoogleAuthService";

// Import Admin Use Cases
import { LoginAdminUseCase } from "../application/usecases/admin/LoginAdminUseCase";
import { CreateAdminUseCase } from "../application/usecases/admin/CreateAdminUseCase";
import { FetchAllUsersUseCase } from "../application/usecases/admin/FetchAllUsersUseCase";
import { BlockUserUseCase } from "../application/usecases/admin/BlockUserUseCase";
import { UnblockUserUseCase } from "../application/usecases/admin/UnblockUserUseCase";
import { FetchRecruitersUseCase } from "../application/usecases/admin/FetchRecruitersUseCase";
import { ApproveRecruiterUseCase } from "../application/usecases/admin/ApproveRecruiterUseCase";
import { AdminDashboardUseCase } from "../application/usecases/admin/AdminDashboardUseCase";

// Import Auth and Recruiter Use Cases
import { SignupUserUseCase } from "../application/usecases/user/SignupUserUseCase";
import { LoginUseCase } from "../application/usecases/user/LoginUseCase";
import { GetUserProfileUseCase } from "../application/usecases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../application/usecases/user/UpdateUserProfileUseCase";
import { RegisterRecruiterUseCase } from "../application/usecases/recruiter/RegisterRecruiterUsecase";
import { LoginRecruiterUseCase } from "../application/usecases/recruiter/LoginRecruiterUseCase";
import { JobPostUseCase } from "../application/usecases/recruiter/JobPostUseCase";
import { GetJobPostsUseCase } from "../application/usecases/user/GetJobPostsUseCase";
import { GetJobPostByIdUseCase } from "../application/usecases/user/GetJobPostByIdUseCase";
import { ApplyForJobUseCase } from "../application/usecases/user/ApplyForJobUseCase";
import { UpdateRecruiterUseCase } from "../application/usecases/recruiter/UpdateRecruiterUseCase";
import { GetRecruiterProfileUseCase } from "../application/usecases/recruiter/GetRecruiterProfileUseCase";

// Import Controllers
import { AdminController } from "../presentation/controllers/AdminController";
import { RecruiterController } from "../presentation/controllers/recruiter/RecruiterController";
import { AuthController } from "../presentation/controllers/user/AuthController";
import { ProfileController } from "../presentation/controllers/user/ProfileController";
import { JobPostController } from "../presentation/controllers/recruiter/JobPostController";
import { JobPostControllerUser } from "../presentation/controllers/user/JobPostControllerUser";

// Import Repositories and Interfaces
import { IRecruiterRepository } from "../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { IJobPostRepository } from "../domain/interfaces/repositories/recruiter/IJobPostRepository";
import { MongoJobPostRepository } from "./database/mongoose/repositories/MongoJobPostRepository";
import { IAdminRepository } from "../domain/interfaces/repositories/admin/IAdminRepository";

import { IPostRepository } from '../domain/interfaces/repositories/user/IPostRepository';
import { MongoPostRepository } from '../infrastructure/database/mongoose/repositories/MongoPostRepository';
import { CreatePostUseCase } from '../application/usecases/user/post/CreatePostUseCase';
import { PostController } from '../presentation/controllers/user/PostController';
import { S3Service } from './services/S3Service';
import { GetAllPostsUseCase } from '../application/usecases/user/post/GetAllPostsUseCase';

// Initialize Inversify Container
const container = new Container();

// Bind Repositories
container.bind(TYPES.IUserRepository).to(MongoUserRepository);
container
  .bind<IRecruiterRepository>(TYPES.IRecruiterRepository)
  .to(MongoRecruiterRepository);
container
  .bind<IJobPostRepository>(TYPES.JobPostRepository)
  .to(MongoJobPostRepository);
container
  .bind<IAdminRepository>(TYPES.IAdminRepository)
  .to(MongoAdminRepository);
container.bind(TYPES.IJobPostUserRepository).to(MongoJobPostUserRepository);

// Bind Services
container.bind(TYPES.IAuthService).to(JwtAuthService);
container.bind(TYPES.NodemailerEmailService).to(NodemailerEmailService);
container.bind(TYPES.GoogleAuthService).to(GoogleAuthService);
container
  .bind<JwtAuthService>(TYPES.JwtAuthService)
  .to(JwtAuthService)
  .inSingletonScope();
container
  .bind<Secret>(TYPES.JwtSecret)
  .toConstantValue(process.env.JWT_SECRET || "secret_1");

// Bind Dynamic OTP Service
container
  .bind(TYPES.OtpService)
  .toDynamicValue(
    () => new OtpService(33 * 1000, container.get(TYPES.NodemailerEmailService))
  );

// Bind Admin Use Cases
container.bind(TYPES.LoginAdminUseCase).to(LoginAdminUseCase);
container.bind(TYPES.FetchAllUsersUseCase).to(FetchAllUsersUseCase);
container.bind(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container.bind(TYPES.UnblockUserUseCase).to(UnblockUserUseCase);
container.bind(TYPES.FetchRecruitersUseCase).to(FetchRecruitersUseCase);
container.bind(TYPES.ApproveRecruiterUseCase).to(ApproveRecruiterUseCase);
container.bind(TYPES.AdminDashboardUseCase).to(AdminDashboardUseCase);

// Bind Auth and Recruiter Use Cases
container.bind(TYPES.SignupUserUseCase).to(SignupUserUseCase);
container.bind(TYPES.LoginUseCase).to(LoginUseCase);
container.bind(TYPES.GetUserProfileUseCase).to(GetUserProfileUseCase);
container.bind(TYPES.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase);
container.bind(TYPES.RegisterRecruiterUseCase).to(RegisterRecruiterUseCase);
container.bind(TYPES.LoginRecruiterUseCase).to(LoginRecruiterUseCase);
container.bind<JobPostUseCase>(TYPES.JobPostUseCase).to(JobPostUseCase);
container.bind(TYPES.GetJobPostsUseCase).to(GetJobPostsUseCase);
container.bind(TYPES.GetJobPostByIdUseCase).to(GetJobPostByIdUseCase);
container.bind(TYPES.ApplyForJobUseCase).to(ApplyForJobUseCase);
container.bind(TYPES.UpdateRecruiterUseCase).to(UpdateRecruiterUseCase);
container.bind(TYPES.GetRecruiterProfileUseCase).to(GetRecruiterProfileUseCase);

// Bind Controllers
container.bind(TYPES.AdminController).to(AdminController);
container.bind(TYPES.RecruiterController).to(RecruiterController);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container
  .bind<ProfileController>(TYPES.ProfileController)
  .to(ProfileController);
container
  .bind<JobPostController>(TYPES.JobPostController)
  .to(JobPostController);
container
  .bind<JobPostControllerUser>(TYPES.JobPostControllerUser)
  .to(JobPostControllerUser);

  container.bind<IPostRepository>(TYPES.IPostRepository).to(MongoPostRepository);
  container.bind<PostController>(PostController).toSelf();
container.bind<CreatePostUseCase>(TYPES.CreatePostUseCase).to(CreatePostUseCase);
container.bind<GetAllPostsUseCase>(TYPES.GetAllPostsUseCase).to(GetAllPostsUseCase);
container.bind<S3Service>(TYPES.S3Service).to(S3Service);

console.log(container);
export { container };
