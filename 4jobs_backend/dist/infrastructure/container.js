"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../types"));
const MongoUserRepository_1 = require("./database/mongoose/repositories/MongoUserRepository");
const MongoRecruiterRepository_1 = require("./database/mongoose/repositories/MongoRecruiterRepository");
const MongoAdminRepository_1 = require("./database/mongoose/repositories/MongoAdminRepository");
const MongoJobPostUserRepository_1 = require("./database/mongoose/repositories/MongoJobPostUserRepository");
const JwtAuthService_1 = require("./services/JwtAuthService");
const OtpService_1 = require("./services/OtpService");
const NodemailerEmailService_1 = require("./services/NodemailerEmailService");
const GoogleAuthService_1 = require("./services/GoogleAuthService");
// Import Admin Use Cases
const LoginAdminUseCase_1 = require("../application/usecases/admin/LoginAdminUseCase");
const FetchAllUsersUseCase_1 = require("../application/usecases/admin/FetchAllUsersUseCase");
const BlockUserUseCase_1 = require("../application/usecases/admin/BlockUserUseCase");
const UnblockUserUseCase_1 = require("../application/usecases/admin/UnblockUserUseCase");
const FetchRecruitersUseCase_1 = require("../application/usecases/admin/FetchRecruitersUseCase");
const ApproveRecruiterUseCase_1 = require("../application/usecases/admin/ApproveRecruiterUseCase");
const AdminDashboardUseCase_1 = require("../application/usecases/admin/AdminDashboardUseCase");
// Import Auth and Recruiter Use Cases
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
// Import Controllers
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
// Initialize Inversify Container
const container = new inversify_1.Container();
exports.container = container;
// Bind Repositories
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
// Bind Services
container.bind(types_1.default.IAuthService).to(JwtAuthService_1.JwtAuthService);
container.bind(types_1.default.NodemailerEmailService).to(NodemailerEmailService_1.NodemailerEmailService);
container.bind(types_1.default.GoogleAuthService).to(GoogleAuthService_1.GoogleAuthService);
container
    .bind(types_1.default.JwtAuthService)
    .to(JwtAuthService_1.JwtAuthService)
    .inSingletonScope();
container
    .bind(types_1.default.JwtSecret)
    .toConstantValue(process.env.JWT_SECRET || "secret_1");
// Bind Dynamic OTP Service
container
    .bind(types_1.default.OtpService)
    .toDynamicValue(() => new OtpService_1.OtpService(33 * 1000, container.get(types_1.default.NodemailerEmailService)));
// Bind Admin Use Cases
container.bind(types_1.default.LoginAdminUseCase).to(LoginAdminUseCase_1.LoginAdminUseCase);
container.bind(types_1.default.FetchAllUsersUseCase).to(FetchAllUsersUseCase_1.FetchAllUsersUseCase);
container.bind(types_1.default.BlockUserUseCase).to(BlockUserUseCase_1.BlockUserUseCase);
container.bind(types_1.default.UnblockUserUseCase).to(UnblockUserUseCase_1.UnblockUserUseCase);
container.bind(types_1.default.FetchRecruitersUseCase).to(FetchRecruitersUseCase_1.FetchRecruitersUseCase);
container.bind(types_1.default.ApproveRecruiterUseCase).to(ApproveRecruiterUseCase_1.ApproveRecruiterUseCase);
container.bind(types_1.default.AdminDashboardUseCase).to(AdminDashboardUseCase_1.AdminDashboardUseCase);
// Bind Auth and Recruiter Use Cases
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
// Bind Controllers
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
container.bind(types_1.default.IPostRepository).to(MongoPostRepository_1.MongoPostRepository);
container.bind(PostController_1.PostController).toSelf();
container.bind(types_1.default.CreatePostUseCase).to(CreatePostUseCase_1.CreatePostUseCase);
container.bind(types_1.default.GetAllPostsUseCase).to(GetAllPostsUseCase_1.GetAllPostsUseCase);
container.bind(types_1.default.S3Service).to(S3Service_1.S3Service);
console.log(container);
