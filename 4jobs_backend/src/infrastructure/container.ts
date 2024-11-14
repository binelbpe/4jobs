import "reflect-metadata";
import { Secret } from "jsonwebtoken";
import { Container } from "inversify";
import TYPES from "../types";
import { Server as SocketIOServer } from "socket.io";
import { MongoUserRepository } from "./database/mongoose/repositories/MongoUserRepository";
import { MongoRecruiterRepository } from "./database/mongoose/repositories/MongoRecruiterRepository";
import { MongoAdminRepository } from "./database/mongoose/repositories/MongoAdminRepository";
import { MongoJobPostUserRepository } from "./database/mongoose/repositories/MongoJobPostUserRepository";
import { JwtAuthService } from "./services/JwtAuthService";
import { OtpService } from "./services/OtpService";
import { NodemailerEmailService } from "./services/NodemailerEmailService";
import { GoogleAuthService } from "./services/GoogleAuthService";
import { UserManager } from "./services/UserManager";
import { EventEmitter } from "events";
import { LoginAdminUseCase } from "../application/usecases/admin/LoginAdminUseCase";
import { CreateAdminUseCase } from "../application/usecases/admin/CreateAdminUseCase";
import { FetchAllUsersUseCase } from "../application/usecases/admin/FetchAllUsersUseCase";
import { BlockUserUseCase } from "../application/usecases/admin/BlockUserUseCase";
import { UnblockUserUseCase } from "../application/usecases/admin/UnblockUserUseCase";
import { FetchRecruitersUseCase } from "../application/usecases/admin/FetchRecruitersUseCase";
import { ApproveRecruiterUseCase } from "../application/usecases/admin/ApproveRecruiterUseCase";
import { AdminDashboardUseCase } from "../application/usecases/admin/AdminDashboardUseCase";
import { IJobPostAdminRepository } from "../domain/interfaces/repositories/admin/IJobPostRepositoryAdmin";
import { MongoJobPostAdminRepository } from "../infrastructure/database/mongoose/repositories/MongoJobPostAdminRepository";
import { FetchJobPostsUseCase } from "../application/usecases/admin/FetchJobPostsUseCase";
import { BlockJobPostUseCase } from "../application/usecases/admin/BlockJobPostUseCase";
import { UnblockJobPostUseCase } from "../application/usecases/admin/UnblockJobPostUseCase";
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
import { AdminController } from "../presentation/controllers/AdminController";
import { RecruiterController } from "../presentation/controllers/recruiter/RecruiterController";
import { AuthController } from "../presentation/controllers/user/AuthController";
import { ProfileController } from "../presentation/controllers/user/ProfileController";
import { JobPostController } from "../presentation/controllers/recruiter/JobPostController";
import { JobPostControllerUser } from "../presentation/controllers/user/JobPostControllerUser";
import { IRecruiterRepository } from "../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { IJobPostRepository } from "../domain/interfaces/repositories/recruiter/IJobPostRepository";
import { MongoJobPostRepository } from "./database/mongoose/repositories/MongoJobPostRepository";
import { IAdminRepository } from "../domain/interfaces/repositories/admin/IAdminRepository";

import { IPostRepository } from "../domain/interfaces/repositories/user/IPostRepository";
import { MongoPostRepository } from "../infrastructure/database/mongoose/repositories/MongoPostRepository";
import { CreatePostUseCase } from "../application/usecases/user/post/CreatePostUseCase";
import { PostController } from "../presentation/controllers/user/PostController";
import { S3Service } from "./services/S3Service";
import { GetAllPostsUseCase } from "../application/usecases/user/post/GetAllPostsUseCase";
import { GetUserPostsUseCase } from "../application/usecases/user/post/GetUserPostsUseCase";
import { DeletePostUseCase } from "../application/usecases/user/post/DeletePostUseCase";
import { EditPostUseCase } from "../application/usecases/user/post/EditPostUseCase";
import { ReportJobUseCase } from "../application/usecases/user/ReportJobUseCase";
import { IMessageRepository } from "../domain/interfaces/repositories/user/IMessageRepository";
import { MessageRepository } from "../infrastructure/database/mongoose/repositories/MongoMessageRepository";
import { MessageUseCase } from "../application/usecases/user/MessageUseCase";
import { MessageController } from "../presentation/controllers/user/MessageController";

import { IConnectionRepository } from "../domain/interfaces/repositories/user/IConnectionRepository";
import { ConnectionUseCase } from "../application/usecases/user/ConnectionUseCase";
import { MongoConnectionRepository } from "./database/mongoose/repositories/MongoConnectionRepository";
import { ConnectionController } from "../presentation/controllers/user/ConnectionController";

import { RecruiterMessageUseCase } from "../application/usecases/recruiter/RecruiterMessageUseCase";
import { RecruiterMessageController } from "../presentation/controllers/recruiter/RecruiterMessageController";
import { MongoRecruiterMessage } from "./database/mongoose/repositories/MongoRecruiterMessage";
import { IRecruiterMessageRepository } from "../domain/interfaces/repositories/recruiter/IRecruiterMessageRepository";
import { UserRecruiterMessageUseCase } from "../application/usecases/user/UserRecruiterMessageUseCase";
import { UserRecruiterMessageController } from "../presentation/controllers/user/UserRecruiterMessageController";
import { MongoUserRecruiterMessageRepository } from "./database/mongoose/repositories/MongoUserRecruiterMessageRepository";
import { IUserRecruiterMessageRepository } from "../domain/interfaces/repositories/user/IUserRecruiterMessageRepository";

import { SubscriptionController } from "../presentation/controllers/recruiter/SubscriptionController";

import { UpdateSubscriptionUseCase } from "../application/usecases/recruiter/UpdateSubscriptionUseCase";
import { ToggleUserPostBlockUseCase } from "../application/usecases/admin/ToggleUserPostBlockUseCase";
import { ISearchRepository } from "../domain/interfaces/repositories/user/ISearchRepository";
import { MongoSearchRepository } from "./database/mongoose/repositories/MongoSearchRepository";
import { SearchUsersAndJobsUseCase } from "../application/usecases/user/SearchUsersAndJobsUseCase";
import { IRecruiterSearchRepository } from "../domain/interfaces/repositories/recruiter/IRecruiterSearchRepository";
import { MongoRecruiterSearchRepository } from "./database/mongoose/repositories/MongoRecruiterSearchRepository";
import { SearchUsersUseCase } from "../application/usecases/recruiter/SearchUsersUseCase";
import { DislikePostUseCase } from "../application/usecases/user/post/DislikePostUseCase";
import { LikePostUseCase } from "../application/usecases/user/post/LikePostUseCase";
import { CommentOnPostUseCase } from "../application/usecases/user/post/CommentOnPostUseCase";
import { IResumeRepository } from "../domain/interfaces/repositories/user/IResumeRepository";
import { MongoResumeRepository } from "./database/mongoose/repositories/MongoResumeRepository";
import { GenerateResumeUseCase } from "../application/usecases/user/GenerateResumeUseCase";
import { ResumeController } from "../presentation/controllers/user/ResumeController";
import { PDFExtractor } from "./services/PDFExtractor";
import { AdvancedJobSearchUseCase } from "../application/usecases/user/AdvancedJobSearchUseCase";
import { AuthMiddleware } from '../presentation/middlewares/authMiddleware';
import { XssMiddleware } from '../presentation/middlewares/xssMiddleware';
import { IAuthMiddlewareService } from '../domain/interfaces/services/IAuthMiddlewareService';
import { IXssService } from '../domain/interfaces/services/IXssService';
import { AuthMiddlewareService } from './services/AuthMiddlewareService';
import { XssService } from './services/XssService';

const container = new Container();

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

container.bind(TYPES.IAuthService).to(JwtAuthService);
container.bind(TYPES.NodemailerEmailService).to(NodemailerEmailService);
container.bind(TYPES.GoogleAuthService).to(GoogleAuthService);
container
  .bind<JwtAuthService>(TYPES.JwtAuthService)
  .to(JwtAuthService)
  .inSingletonScope();
container
  .bind<Secret>(TYPES.JwtSecret)
  .toConstantValue(process.env.JWT_SECRET!);

container
  .bind(TYPES.OtpService)
  .toDynamicValue(
    () => new OtpService(31 * 1000, container.get(TYPES.NodemailerEmailService))
  );

container.bind(TYPES.LoginAdminUseCase).to(LoginAdminUseCase);
container.bind(TYPES.FetchAllUsersUseCase).to(FetchAllUsersUseCase);
container.bind(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container.bind(TYPES.UnblockUserUseCase).to(UnblockUserUseCase);
container.bind(TYPES.FetchRecruitersUseCase).to(FetchRecruitersUseCase);
container.bind(TYPES.ApproveRecruiterUseCase).to(ApproveRecruiterUseCase);
container.bind(TYPES.AdminDashboardUseCase).to(AdminDashboardUseCase);
container
  .bind<IJobPostAdminRepository>(TYPES.IJobPostAdminRepository)
  .to(MongoJobPostAdminRepository);
container
  .bind<FetchJobPostsUseCase>(TYPES.FetchJobPostsUseCase)
  .to(FetchJobPostsUseCase);
container
  .bind<BlockJobPostUseCase>(TYPES.BlockJobPostUseCase)
  .to(BlockJobPostUseCase);
container
  .bind<UnblockJobPostUseCase>(TYPES.UnblockJobPostUseCase)
  .to(UnblockJobPostUseCase);
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

container.bind<IPostRepository>(TYPES.PostRepository).to(MongoPostRepository);
container.bind<IPostRepository>(TYPES.IPostRepository).to(MongoPostRepository);
container.bind<PostController>(PostController).toSelf();
container
  .bind<CreatePostUseCase>(TYPES.CreatePostUseCase)
  .to(CreatePostUseCase);
container
  .bind<GetAllPostsUseCase>(TYPES.GetAllPostsUseCase)
  .to(GetAllPostsUseCase);

container
  .bind<GetUserPostsUseCase>(TYPES.GetUserPostsUseCase)
  .to(GetUserPostsUseCase);
container
  .bind<DeletePostUseCase>(TYPES.DeletePostUseCase)
  .to(DeletePostUseCase);
container.bind<EditPostUseCase>(TYPES.EditPostUseCase).to(EditPostUseCase);
container.bind<ReportJobUseCase>(TYPES.ReportJobUseCase).to(ReportJobUseCase);
container.bind<S3Service>(TYPES.S3Service).to(S3Service);
container.bind<PDFExtractor>(TYPES.PDFExtractor).to(PDFExtractor);

container
  .bind<IConnectionRepository>(TYPES.IConnectionRepository)
  .to(MongoConnectionRepository);
container
  .bind<ConnectionUseCase>(TYPES.ConnectionUseCase)
  .to(ConnectionUseCase);
container
  .bind<ConnectionController>(TYPES.ConnectionController)
  .to(ConnectionController);

container
  .bind<SocketIOServer>(TYPES.SocketIOServer)
  .toConstantValue(new SocketIOServer());
container
  .bind<UserManager>(TYPES.UserManager)
  .to(UserManager)
  .inSingletonScope();
container
  .bind<EventEmitter>(TYPES.NotificationEventEmitter)
  .toDynamicValue(() => {
    return new EventEmitter();
  })
  .inSingletonScope();

container
  .bind<IMessageRepository>(TYPES.IMessageRepository)
  .to(MessageRepository);
container.bind<MessageUseCase>(TYPES.MessageUseCase).to(MessageUseCase);
container
  .bind<MessageController>(TYPES.MessageController)
  .to(MessageController)
  .inSingletonScope();

container
  .bind<IRecruiterMessageRepository>(TYPES.IRecruiterMessageRepository)
  .to(MongoRecruiterMessage);
container
  .bind<RecruiterMessageUseCase>(TYPES.RecruiterMessageUseCase)
  .to(RecruiterMessageUseCase);
container
  .bind<RecruiterMessageController>(TYPES.RecruiterMessageController)
  .to(RecruiterMessageController);

container
  .bind<IUserRecruiterMessageRepository>(TYPES.IUserRecruiterMessageRepository)
  .to(MongoUserRecruiterMessageRepository);
container
  .bind<UserRecruiterMessageUseCase>(TYPES.UserRecruiterMessageUseCase)
  .to(UserRecruiterMessageUseCase);
container
  .bind<UserRecruiterMessageController>(TYPES.UserRecruiterMessageController)
  .to(UserRecruiterMessageController);

container
  .bind<SubscriptionController>(TYPES.SubscriptionController)
  .to(SubscriptionController);

container
  .bind<UpdateSubscriptionUseCase>(TYPES.UpdateSubscriptionUseCase)
  .to(UpdateSubscriptionUseCase);
container
  .bind<ToggleUserPostBlockUseCase>(TYPES.ToggleUserPostBlockUseCase)
  .to(ToggleUserPostBlockUseCase);

container
  .bind<ISearchRepository>(TYPES.ISearchRepository)
  .to(MongoSearchRepository);
container
  .bind<SearchUsersAndJobsUseCase>(TYPES.SearchUsersAndJobsUseCase)
  .to(SearchUsersAndJobsUseCase);

container
  .bind<IRecruiterSearchRepository>(TYPES.IRecruiterSearchRepository)
  .to(MongoRecruiterSearchRepository);
container
  .bind<SearchUsersUseCase>(TYPES.SearchUsersUseCase)
  .to(SearchUsersUseCase);
container
  .bind<DislikePostUseCase>(TYPES.DislikePostUseCase)
  .to(DislikePostUseCase);
container.bind<LikePostUseCase>(TYPES.LikePostUseCase).to(LikePostUseCase);
container
  .bind<CommentOnPostUseCase>(TYPES.CommentOnPostUseCase)
  .to(CommentOnPostUseCase);

container
  .bind<IResumeRepository>(TYPES.IResumeRepository)
  .to(MongoResumeRepository);
container
  .bind<GenerateResumeUseCase>(TYPES.GenerateResumeUseCase)
  .to(GenerateResumeUseCase);
container.bind<ResumeController>(TYPES.ResumeController).to(ResumeController);
container.bind<AdvancedJobSearchUseCase>(TYPES.AdvancedJobSearchUseCase).to(AdvancedJobSearchUseCase);

container.bind<AuthMiddleware>(AuthMiddleware).toSelf();
container.bind<XssMiddleware>(XssMiddleware).toSelf();

container.bind<IAuthMiddlewareService>(TYPES.AuthMiddlewareService)
  .to(AuthMiddlewareService)
  .inSingletonScope();

container.bind<IXssService>(TYPES.XssService)
  .to(XssService)
  .inSingletonScope();

export { container };
