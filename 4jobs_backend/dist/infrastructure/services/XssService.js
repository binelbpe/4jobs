"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XssService = void 0;
const inversify_1 = require("inversify");
const xss_1 = __importDefault(require("xss"));
let XssService = class XssService {
    constructor() {
        this.options = {
            whiteList: {}, // Disallow all HTML tags
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style', 'iframe', 'frame', 'object', 'embed']
        };
    }
    sanitize(value) {
        if (typeof value === 'string') {
            return (0, xss_1.default)(value, this.options);
        }
        if (Array.isArray(value)) {
            return value.map(item => this.sanitize(item));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).reduce((acc, key) => {
                acc[key] = this.sanitize(value[key]);
                return acc;
            }, {});
        }
        return value;
    }
    getOptions() {
        return this.options;
    }
};
exports.XssService = XssService;
exports.XssService = XssService = __decorate([
    (0, inversify_1.injectable)()
], XssService);
