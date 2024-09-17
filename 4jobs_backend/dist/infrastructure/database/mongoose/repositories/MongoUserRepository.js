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
exports.MongoUserRepository = void 0;
const UserModel_1 = require("../models/UserModel");
class MongoUserRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(id).lean();
            return user ? this.mapToUser(user) : null;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findOne({ email }).lean();
            return user ? this.mapToUser(user) : null;
        });
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new UserModel_1.UserModel(user);
            yield newUser.save();
            return this.mapToUser(newUser.toObject());
        });
    }
    update(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
            return updatedUser ? this.mapToUser(updatedUser) : null;
        });
    }
    mapToUser(doc) {
        return {
            id: doc._id.toString(),
            email: doc.email,
            password: doc.password,
            name: doc.name,
            role: doc.role,
            isAdmin: doc.isAdmin,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
exports.MongoUserRepository = MongoUserRepository;
