"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAdminUseCase = void 0;
class CreateAdminUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    execute(email, password, name, adminLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }
            const hashedPassword = yield this.authService.hashPassword(password);
            const admin = yield this.userRepository.create({
                email,
                password: hashedPassword,
                name,
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
                isAdmin: true,
            });
            const adminUser = Object.assign(Object.assign({}, admin), { adminLevel });
            yield this.userRepository.update(admin.id, adminUser);
            return adminUser;
        });
    }
}
exports.CreateAdminUseCase = CreateAdminUseCase;
