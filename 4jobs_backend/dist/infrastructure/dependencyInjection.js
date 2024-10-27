"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("./types"));
const RecruiterMessageUseCase_1 = require("./application/usecases/recruiter/RecruiterMessageUseCase");
const InitiateVideoCallUseCase_1 = require("./application/usecases/recruiter/InitiateVideoCallUseCase");
const container = new inversify_1.Container();
container.bind(types_1.default.RecruiterMessageUseCase).to(RecruiterMessageUseCase_1.RecruiterMessageUseCase);
container.bind(types_1.default.InitiateVideoCallUseCase).to(InitiateVideoCallUseCase_1.InitiateVideoCallUseCase);
// ... other bindings
