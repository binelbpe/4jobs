"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TYPES = {
    IUserRepository: Symbol.for("IUserRepository"),
    IJobPostUserRepository: Symbol.for("IJobPostUserRepository"),
    GetJobPostsUseCase: Symbol.for("GetJobPostsUseCase"),
    GetJobPostByIdUseCase: Symbol.for("GetJobPostByIdUseCase"),
    ApplyForJobUseCase: Symbol.for("ApplyForJobUseCase"),
    IAdminRepository: Symbol.for("IAdminRepository"),
    IRecruiterRepository: Symbol.for("IRecruiterRepository"),
    IAuthService: Symbol.for("IAuthService"),
    JwtSecret: Symbol.for("JwtSecret"),
    OtpService: Symbol.for("OtpService"),
    NodemailerEmailService: Symbol.for("NodemailerEmailService"),
    GoogleAuthService: Symbol.for("GoogleAuthService"),
    LoginAdminUseCase: Symbol.for("LoginAdminUseCase"),
    FetchAllUsersUseCase: Symbol.for("FetchAllUsersUseCase"),
    BlockUserUseCase: Symbol.for("BlockUserUseCase"),
    UnblockUserUseCase: Symbol.for("UnblockUserUseCase"),
    FetchRecruitersUseCase: Symbol.for("FetchRecruitersUseCase"),
    ApproveRecruiterUseCase: Symbol.for("ApproveRecruiterUseCase"),
    AdminDashboardUseCase: Symbol.for("AdminDashboardUseCase"),
    SignupUserUseCase: Symbol.for("SignupUserUseCase"),
    RegisterRecruiterUseCase: Symbol.for("RegisterRecruiterUseCase"),
    LoginRecruiterUseCase: Symbol.for("LoginRecruiterUseCase"),
    LoginUseCase: Symbol.for("LoginUseCase"),
    JwtAuthService: Symbol.for("JwtAuthService"),
    AdminController: Symbol.for("AdminController"),
    RecruiterController: Symbol.for("RecruiterController"),
    AuthController: Symbol.for("AuthController"),
    IUserProfileRepository: Symbol.for("IUserProfileRepository"),
    GetUserProfileUseCase: Symbol.for("GetUserProfileUseCase"),
    UpdateUserProfileUseCase: Symbol.for("UpdateUserProfileUseCase"),
    ProfileController: Symbol.for("ProfileController"),
    JobPostRepository: Symbol.for("JobPostRepository"),
    JobPostUseCase: Symbol.for("JobPostUseCase"),
    JobPostController: Symbol.for("JobPostController"),
    JobPostControllerUser: Symbol.for("JobPostControllerUser"),
    UpdateRecruiterUseCase: Symbol.for("UpdateRecruiterUseCase"),
    GetRecruiterProfileUseCase: Symbol.for("GetRecruiterProfileUseCase"),
    PostRepository: Symbol.for("PostRepository"),
    CreatePostUseCase: Symbol.for("CreatePostUseCase"),
    GetAllPostsUseCase: Symbol.for("GetAllPostsUseCase"),
    GetUserPostsUseCase: Symbol.for("GetUserPostsUseCase"),
    DeletePostUseCase: Symbol.for("DeletePostUseCase"),
    LikePostUseCase: Symbol.for("LikePostUseCase"),
    DislikePostUseCase: Symbol.for("DislikePostUseCase"),
    UnlikePostUseCase: Symbol.for("UnlikePostUseCase"),
    CommentOnPostUseCase: Symbol.for("CommentOnPostUseCase"),
    DeleteCommentUseCase: Symbol.for("DeleteCommentUseCase"),
    S3Service: Symbol.for("S3Service"),
    PDFExtractor: Symbol.for("PDFExtractor"),
    IPostRepository: Symbol.for("IPostRepository"),
    EditPostUseCase: Symbol.for("EditPostUseCase"),
    ReportJobUseCase: Symbol.for("ReportJobUseCase"),
    IJobPostAdminRepository: Symbol.for("IJobPostAdminRepository"),
    FetchJobPostsUseCase: Symbol.for("FetchJobPostsUseCase"),
    BlockJobPostUseCase: Symbol.for("BlockJobPostUseCase"),
    UnblockJobPostUseCase: Symbol.for("UnblockJobPostUseCase"),
    ConnectionUseCase: Symbol.for("ConnectionUseCase"),
    IConnectionRepository: Symbol.for("IConnectionRepository"),
    ConnectionController: Symbol.for("ConnectionController"),
    SocketIOServer: Symbol.for("SocketIOServer"),
    UserManager: Symbol.for("UserManager"),
    NotificationEventEmitter: Symbol.for("NotificationEventEmitter"),
    MessageUseCase: Symbol.for("MessageUseCase"),
    MessageController: Symbol.for("MessageController"),
    IMessageRepository: Symbol.for("IMessageRepository"),
    IRecruiterMessageRepository: Symbol.for("IRecruiterMessageRepository"),
    RecruiterMessageUseCase: Symbol.for("RecruiterMessageUseCase"),
    RecruiterMessageController: Symbol.for("RecruiterMessageController"),
    IUserRecruiterMessageRepository: Symbol.for("IUserRecruiterMessageRepository"),
    UserRecruiterMessageUseCase: Symbol.for("UserRecruiterMessageUseCase"),
    UserRecruiterMessageController: Symbol.for("UserRecruiterMessageController"),
    SubscriptionController: Symbol.for("SubscriptionController"),
    UpdateSubscriptionUseCase: Symbol.for("UpdateSubscriptionUseCase"),
    ToggleUserPostBlockUseCase: Symbol.for("ToggleUserPostBlockUseCase"),
    ISearchRepository: Symbol.for("ISearchRepository"),
    SearchUsersAndJobsUseCase: Symbol.for("SearchUsersAndJobsUseCase"),
    IRecruiterSearchRepository: Symbol.for("IRecruiterSearchRepository"),
    SearchUsersUseCase: Symbol.for("SearchUsersUseCase"),
    IResumeRepository: Symbol.for("IResumeRepository"),
    GenerateResumeUseCase: Symbol.for("GenerateResumeUseCase"),
    ResumeController: Symbol.for("ResumeController"),
    AdvancedJobSearchUseCase: Symbol.for("AdvancedJobSearchUseCase"),
    AuthMiddlewareService: Symbol.for("AuthMiddlewareService"),
    XssService: Symbol.for("XssService"),
    RateLimiterService: Symbol.for("RateLimiterService"),
    CsrfService: Symbol.for("CsrfService"),
};
exports.default = TYPES;
