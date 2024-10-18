"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.MongoRecruiterSearchRepository = void 0;
const inversify_1 = require("inversify");
const UserModel_1 = require("../models/UserModel");
let MongoRecruiterSearchRepository = class MongoRecruiterSearchRepository {
    searchUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield UserModel_1.UserModel.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { skills: { $elemMatch: { $regex: query, $options: 'i' } } }
                ]
            }).limit(10);
            return users.map((userDoc) => ({
                id: userDoc._id.toString(),
                name: userDoc.name,
                email: userDoc.email,
                skills: userDoc.skills,
                profileImage: userDoc.profileImage
            }));
        });
    }
};
exports.MongoRecruiterSearchRepository = MongoRecruiterSearchRepository;
exports.MongoRecruiterSearchRepository = MongoRecruiterSearchRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoRecruiterSearchRepository);
