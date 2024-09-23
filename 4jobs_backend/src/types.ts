const TYPES = {
  IUserRepository: Symbol.for('IUserRepository'),
  IRecruiterRepository: Symbol.for('IRecruiterRepository'),
  IAuthService: Symbol.for('IAuthService'),
  JwtSecret: Symbol.for('JwtSecret'),
  OtpService: Symbol.for('OtpService'),
  NodemailerEmailService: Symbol.for('NodemailerEmailService'),
  GoogleAuthService: Symbol.for('GoogleAuthService'),
  LoginAdminUseCase: Symbol.for('LoginAdminUseCase'),
  SignupUserUseCase: Symbol.for('SignupUserUseCase'),
  RegisterRecruiterUseCase: Symbol.for('RegisterRecruiterUseCase'),
  LoginRecruiterUseCase: Symbol.for('LoginRecruiterUseCase'),
  LoginUseCase: Symbol.for('LoginUseCase'),
  JwtAuthService: Symbol.for('JwtAuthService'),
  AdminController: Symbol.for('AdminController'),
  RecruiterController: Symbol.for('RecruiterController'),
  AuthController: Symbol.for('AuthController'),
    IUserProfileRepository: Symbol.for('IUserProfileRepository'),
  GetUserProfileUseCase: Symbol.for('GetUserProfileUseCase'),
  UpdateUserProfileUseCase: Symbol.for('UpdateUserProfileUseCase'),
  ProfileController: Symbol.for('ProfileController'),
};

export default TYPES;
