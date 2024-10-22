"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../types"));
const socket_io_1 = require("socket.io");
const MongoUserRepository_1 = require("./database/mongoose/repositories/MongoUserRepository");
const MongoRecruiterRepository_1 = require("./database/mongoose/repositories/MongoRecruiterRepository");
const MongoAdminRepository_1 = require("./database/mongoose/repositories/MongoAdminRepository");
const MongoJobPostUserRepository_1 = require("./database/mongoose/repositories/MongoJobPostUserRepository");
const JwtAuthService_1 = require("./services/JwtAuthService");
const OtpService_1 = require("./services/OtpService");
const NodemailerEmailService_1 = require("./services/NodemailerEmailService");
const GoogleAuthService_1 = require("./services/GoogleAuthService");
const UserManager_1 = require("./services/UserManager");
const events_1 = require("events");
const LoginAdminUseCase_1 = require("../application/usecases/admin/LoginAdminUseCase");
const FetchAllUsersUseCase_1 = require("../application/usecases/admin/FetchAllUsersUseCase");
const BlockUserUseCase_1 = require("../application/usecases/admin/BlockUserUseCase");
const UnblockUserUseCase_1 = require("../application/usecases/admin/UnblockUserUseCase");
const FetchRecruitersUseCase_1 = require("../application/usecases/admin/FetchRecruitersUseCase");
const ApproveRecruiterUseCase_1 = require("../application/usecases/admin/ApproveRecruiterUseCase");
const AdminDashboardUseCase_1 = require("../application/usecases/admin/AdminDashboardUseCase");
const MongoJobPostAdminRepository_1 = require("../infrastructure/database/mongoose/repositories/MongoJobPostAdminRepository");
const FetchJobPostsUseCase_1 = require("../application/usecases/admin/FetchJobPostsUseCase");
const BlockJobPostUseCase_1 = require("../application/usecases/admin/BlockJobPostUseCase");
const UnblockJobPostUseCase_1 = require("../application/usecases/admin/UnblockJobPostUseCase");
const SignupUserUseCase_1 = require("../application/usecases/user/SignupUserUseCase");
const LoginUseCase_1 = require("../application/usecases/user/LoginUseCase");
const GetUserProfileUseCase_1 = require("../application/usecases/user/GetUserProfileUseCase");
const UpdateUserProfileUseCase_1 = require("../application/usecases/user/UpdateUserProfileUseCase");
const RegisterRecruiterUsecase_1 = require("../application/usecases/recruiter/RegisterRecruiterUsecase");
const LoginRecruiterUseCase_1 = require("../application/usecases/recruiter/LoginRecruiterUseCase");
const JobPostUseCase_1 = require("../application/usecases/recruiter/JobPostUseCase");
const GetJobPostsUseCase_1 = require("../application/usecases/user/GetJobPostsUseCase");
const GetJobPostByIdUseCase_1 = require("../application/usecases/user/GetJobPostByIdUseCase");
const ApplyForJobUseCase_1 = require("../application/usecases/user/ApplyForJobUseCase");
const UpdateRecruiterUseCase_1 = require("../application/usecases/recruiter/UpdateRecruiterUseCase");
const GetRecruiterProfileUseCase_1 = require("../application/usecases/recruiter/GetRecruiterProfileUseCase");
const AdminController_1 = require("../presentation/controllers/AdminController");
const RecruiterController_1 = require("../presentation/controllers/recruiter/RecruiterController");
const AuthController_1 = require("../presentation/controllers/user/AuthController");
const ProfileController_1 = require("../presentation/controllers/user/ProfileController");
const JobPostController_1 = require("../presentation/controllers/recruiter/JobPostController");
const JobPostControllerUser_1 = require("../presentation/controllers/user/JobPostControllerUser");
const MongoJobPostRepository_1 = require("./database/mongoose/repositories/MongoJobPostRepository");
const MongoPostRepository_1 = require("../infrastructure/database/mongoose/repositories/MongoPostRepository");
const CreatePostUseCase_1 = require("../application/usecases/user/post/CreatePostUseCase");
const PostController_1 = require("../presentation/controllers/user/PostController");
const S3Service_1 = require("./services/S3Service");
const GetAllPostsUseCase_1 = require("../application/usecases/user/post/GetAllPostsUseCase");
const GetUserPostsUseCase_1 = require("../application/usecases/user/post/GetUserPostsUseCase");
const DeletePostUseCase_1 = require("../application/usecases/user/post/DeletePostUseCase");
const EditPostUseCase_1 = require("../application/usecases/user/post/EditPostUseCase");
const ReportJobUseCase_1 = require("../application/usecases/user/ReportJobUseCase");
const MongoMessageRepository_1 = require("../infrastructure/database/mongoose/repositories/MongoMessageRepository");
const MessageUseCase_1 = require("../application/usecases/user/MessageUseCase");
const MessageController_1 = require("../presentation/controllers/user/MessageController");
const ConnectionUseCase_1 = require("../application/usecases/user/ConnectionUseCase");
const MongoConnectionRepository_1 = require("./database/mongoose/repositories/MongoConnectionRepository");
const ConnectionController_1 = require("../presentation/controllers/user/ConnectionController");
const RecruiterMessageUseCase_1 = require("../application/usecases/recruiter/RecruiterMessageUseCase");
const RecruiterMessageController_1 = require("../presentation/controllers/recruiter/RecruiterMessageController");
const MongoRecruiterMessage_1 = require("./database/mongoose/repositories/MongoRecruiterMessage");
const UserRecruiterMessageUseCase_1 = require("../application/usecases/user/UserRecruiterMessageUseCase");
const UserRecruiterMessageController_1 = require("../presentation/controllers/user/UserRecruiterMessageController");
const MongoUserRecruiterMessageRepository_1 = require("./database/mongoose/repositories/MongoUserRecruiterMessageRepository");
const SubscriptionController_1 = require("../presentation/controllers/recruiter/SubscriptionController");
const UpdateSubscriptionUseCase_1 = require("../application/usecases/recruiter/UpdateSubscriptionUseCase");
const ToggleUserPostBlockUseCase_1 = require("../application/usecases/admin/ToggleUserPostBlockUseCase");
const MongoSearchRepository_1 = require("./database/mongoose/repositories/MongoSearchRepository");
const SearchUsersAndJobsUseCase_1 = require("../application/usecases/user/SearchUsersAndJobsUseCase");
const MongoRecruiterSearchRepository_1 = require("./database/mongoose/repositories/MongoRecruiterSearchRepository");
const SearchUsersUseCase_1 = require("../application/usecases/recruiter/SearchUsersUseCase");
const MongoVideoCallRepository_1 = require("./database/mongoose/repositories/MongoVideoCallRepository");
const InitiateVideoCallUseCase_1 = require("../application/usecases/recruiter/InitiateVideoCallUseCase");
const RespondToVideoCallUseCase_1 = require("../application/usecases/user/RespondToVideoCallUseCase");
const MongoUserVideoCallRepository_1 = require("./database/mongoose/repositories/MongoUserVideoCallRepository");
const UserVideoCallUseCase_1 = require("../application/usecases/user/UserVideoCallUseCase");
const DislikePostUseCase_1 = require("../application/usecases/user/post/DislikePostUseCase");
const LikePostUseCase_1 = require("../application/usecases/user/post/LikePostUseCase");
const CommentOnPostUseCase_1 = require("../application/usecases/user/post/CommentOnPostUseCase");
const MongoResumeRepository_1 = require("./database/mongoose/repositories/MongoResumeRepository");
const GenerateResumeUseCase_1 = require("../application/usecases/user/GenerateResumeUseCase");
const ResumeController_1 = require("../presentation/controllers/user/ResumeController");
const PDFExtractor_1 = require("./services/PDFExtractor");
const container = new inversify_1.Container();
exports.container = container;
container.bind(types_1.default.IUserRepository).to(MongoUserRepository_1.MongoUserRepository);
container
    .bind(types_1.default.IRecruiterRepository)
    .to(MongoRecruiterRepository_1.MongoRecruiterRepository);
container
    .bind(types_1.default.JobPostRepository)
    .to(MongoJobPostRepository_1.MongoJobPostRepository);
container
    .bind(types_1.default.IAdminRepository)
    .to(MongoAdminRepository_1.MongoAdminRepository);
container.bind(types_1.default.IJobPostUserRepository).to(MongoJobPostUserRepository_1.MongoJobPostUserRepository);
container.bind(types_1.default.IAuthService).to(JwtAuthService_1.JwtAuthService);
container.bind(types_1.default.NodemailerEmailService).to(NodemailerEmailService_1.NodemailerEmailService);
container.bind(types_1.default.GoogleAuthService).to(GoogleAuthService_1.GoogleAuthService);
container
    .bind(types_1.default.JwtAuthService)
    .to(JwtAuthService_1.JwtAuthService)
    .inSingletonScope();
container
    .bind(types_1.default.JwtSecret)
    .toConstantValue(process.env.JWT_SECRET);
container
    .bind(types_1.default.OtpService)
    .toDynamicValue(() => new OtpService_1.OtpService(33 * 1000, container.get(types_1.default.NodemailerEmailService)));
container.bind(types_1.default.LoginAdminUseCase).to(LoginAdminUseCase_1.LoginAdminUseCase);
container.bind(types_1.default.FetchAllUsersUseCase).to(FetchAllUsersUseCase_1.FetchAllUsersUseCase);
container.bind(types_1.default.BlockUserUseCase).to(BlockUserUseCase_1.BlockUserUseCase);
container.bind(types_1.default.UnblockUserUseCase).to(UnblockUserUseCase_1.UnblockUserUseCase);
container.bind(types_1.default.FetchRecruitersUseCase).to(FetchRecruitersUseCase_1.FetchRecruitersUseCase);
container.bind(types_1.default.ApproveRecruiterUseCase).to(ApproveRecruiterUseCase_1.ApproveRecruiterUseCase);
container.bind(types_1.default.AdminDashboardUseCase).to(AdminDashboardUseCase_1.AdminDashboardUseCase);
container
    .bind(types_1.default.IJobPostAdminRepository)
    .to(MongoJobPostAdminRepository_1.MongoJobPostAdminRepository);
container
    .bind(types_1.default.FetchJobPostsUseCase)
    .to(FetchJobPostsUseCase_1.FetchJobPostsUseCase);
container
    .bind(types_1.default.BlockJobPostUseCase)
    .to(BlockJobPostUseCase_1.BlockJobPostUseCase);
container
    .bind(types_1.default.UnblockJobPostUseCase)
    .to(UnblockJobPostUseCase_1.UnblockJobPostUseCase);
container.bind(types_1.default.SignupUserUseCase).to(SignupUserUseCase_1.SignupUserUseCase);
container.bind(types_1.default.LoginUseCase).to(LoginUseCase_1.LoginUseCase);
container.bind(types_1.default.GetUserProfileUseCase).to(GetUserProfileUseCase_1.GetUserProfileUseCase);
container.bind(types_1.default.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase_1.UpdateUserProfileUseCase);
container.bind(types_1.default.RegisterRecruiterUseCase).to(RegisterRecruiterUsecase_1.RegisterRecruiterUseCase);
container.bind(types_1.default.LoginRecruiterUseCase).to(LoginRecruiterUseCase_1.LoginRecruiterUseCase);
container.bind(types_1.default.JobPostUseCase).to(JobPostUseCase_1.JobPostUseCase);
container.bind(types_1.default.GetJobPostsUseCase).to(GetJobPostsUseCase_1.GetJobPostsUseCase);
container.bind(types_1.default.GetJobPostByIdUseCase).to(GetJobPostByIdUseCase_1.GetJobPostByIdUseCase);
container.bind(types_1.default.ApplyForJobUseCase).to(ApplyForJobUseCase_1.ApplyForJobUseCase);
container.bind(types_1.default.UpdateRecruiterUseCase).to(UpdateRecruiterUseCase_1.UpdateRecruiterUseCase);
container.bind(types_1.default.GetRecruiterProfileUseCase).to(GetRecruiterProfileUseCase_1.GetRecruiterProfileUseCase);
container.bind(types_1.default.AdminController).to(AdminController_1.AdminController);
container.bind(types_1.default.RecruiterController).to(RecruiterController_1.RecruiterController);
container.bind(types_1.default.AuthController).to(AuthController_1.AuthController);
container
    .bind(types_1.default.ProfileController)
    .to(ProfileController_1.ProfileController);
container
    .bind(types_1.default.JobPostController)
    .to(JobPostController_1.JobPostController);
container
    .bind(types_1.default.JobPostControllerUser)
    .to(JobPostControllerUser_1.JobPostControllerUser);
container.bind(types_1.default.PostRepository).to(MongoPostRepository_1.MongoPostRepository);
container.bind(types_1.default.IPostRepository).to(MongoPostRepository_1.MongoPostRepository);
container.bind(PostController_1.PostController).toSelf();
container
    .bind(types_1.default.CreatePostUseCase)
    .to(CreatePostUseCase_1.CreatePostUseCase);
container
    .bind(types_1.default.GetAllPostsUseCase)
    .to(GetAllPostsUseCase_1.GetAllPostsUseCase);
container
    .bind(types_1.default.GetUserPostsUseCase)
    .to(GetUserPostsUseCase_1.GetUserPostsUseCase);
container
    .bind(types_1.default.DeletePostUseCase)
    .to(DeletePostUseCase_1.DeletePostUseCase);
container.bind(types_1.default.EditPostUseCase).to(EditPostUseCase_1.EditPostUseCase);
container.bind(types_1.default.ReportJobUseCase).to(ReportJobUseCase_1.ReportJobUseCase);
container.bind(types_1.default.S3Service).to(S3Service_1.S3Service);
container.bind(types_1.default.PDFExtractor).to(PDFExtractor_1.PDFExtractor);
container
    .bind(types_1.default.IConnectionRepository)
    .to(MongoConnectionRepository_1.MongoConnectionRepository);
container
    .bind(types_1.default.ConnectionUseCase)
    .to(ConnectionUseCase_1.ConnectionUseCase);
container
    .bind(types_1.default.ConnectionController)
    .to(ConnectionController_1.ConnectionController);
container
    .bind(types_1.default.SocketIOServer)
    .toConstantValue(new socket_io_1.Server());
container
    .bind(types_1.default.UserManager)
    .to(UserManager_1.UserManager)
    .inSingletonScope();
container
    .bind(types_1.default.NotificationEventEmitter)
    .toDynamicValue(() => {
    return new events_1.EventEmitter();
})
    .inSingletonScope();
container
    .bind(types_1.default.IMessageRepository)
    .to(MongoMessageRepository_1.MessageRepository);
container.bind(types_1.default.MessageUseCase).to(MessageUseCase_1.MessageUseCase);
container
    .bind(types_1.default.MessageController)
    .to(MessageController_1.MessageController)
    .inSingletonScope();
container
    .bind(types_1.default.IRecruiterMessageRepository)
    .to(MongoRecruiterMessage_1.MongoRecruiterMessage);
container
    .bind(types_1.default.RecruiterMessageUseCase)
    .to(RecruiterMessageUseCase_1.RecruiterMessageUseCase);
container
    .bind(types_1.default.RecruiterMessageController)
    .to(RecruiterMessageController_1.RecruiterMessageController);
container
    .bind(types_1.default.IUserRecruiterMessageRepository)
    .to(MongoUserRecruiterMessageRepository_1.MongoUserRecruiterMessageRepository);
container
    .bind(types_1.default.UserRecruiterMessageUseCase)
    .to(UserRecruiterMessageUseCase_1.UserRecruiterMessageUseCase);
container
    .bind(types_1.default.UserRecruiterMessageController)
    .to(UserRecruiterMessageController_1.UserRecruiterMessageController);
container
    .bind(types_1.default.SubscriptionController)
    .to(SubscriptionController_1.SubscriptionController);
container
    .bind(types_1.default.UpdateSubscriptionUseCase)
    .to(UpdateSubscriptionUseCase_1.UpdateSubscriptionUseCase);
container
    .bind(types_1.default.ToggleUserPostBlockUseCase)
    .to(ToggleUserPostBlockUseCase_1.ToggleUserPostBlockUseCase);
container
    .bind(types_1.default.ISearchRepository)
    .to(MongoSearchRepository_1.MongoSearchRepository);
container
    .bind(types_1.default.SearchUsersAndJobsUseCase)
    .to(SearchUsersAndJobsUseCase_1.SearchUsersAndJobsUseCase);
container
    .bind(types_1.default.IRecruiterSearchRepository)
    .to(MongoRecruiterSearchRepository_1.MongoRecruiterSearchRepository);
container
    .bind(types_1.default.SearchUsersUseCase)
    .to(SearchUsersUseCase_1.SearchUsersUseCase);
container
    .bind(types_1.default.IVideoCallRepository)
    .to(MongoVideoCallRepository_1.MongoVideoCallRepository);
container
    .bind(types_1.default.InitiateVideoCallUseCase)
    .to(InitiateVideoCallUseCase_1.InitiateVideoCallUseCase);
container
    .bind(types_1.default.RespondToVideoCallUseCase)
    .to(RespondToVideoCallUseCase_1.RespondToVideoCallUseCase);
container
    .bind(types_1.default.IUserVideoCallRepository)
    .to(MongoUserVideoCallRepository_1.MongoUserVideoCallRepository);
container
    .bind(types_1.default.UserVideoCallUseCase)
    .to(UserVideoCallUseCase_1.UserVideoCallUseCase);
container
    .bind(types_1.default.DislikePostUseCase)
    .to(DislikePostUseCase_1.DislikePostUseCase);
container.bind(types_1.default.LikePostUseCase).to(LikePostUseCase_1.LikePostUseCase);
container
    .bind(types_1.default.CommentOnPostUseCase)
    .to(CommentOnPostUseCase_1.CommentOnPostUseCase);
container
    .bind(types_1.default.IResumeRepository)
    .to(MongoResumeRepository_1.MongoResumeRepository);
container
    .bind(types_1.default.GenerateResumeUseCase)
    .to(GenerateResumeUseCase_1.GenerateResumeUseCase);
container.bind(types_1.default.ResumeController).to(ResumeController_1.ResumeController);
console.log(container);
