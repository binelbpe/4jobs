"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.PDFExtractor = void 0;
const inversify_1 = require("inversify");
const node_poppler_1 = require("node-poppler");
let PDFExtractor = class PDFExtractor {
    constructor() {
        this.poppler = new node_poppler_1.Poppler();
    }
    extractText(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Starting PDF extraction");
                const options = {
                    maintainLayout: true,
                    quiet: true
                };
                const result = yield this.poppler.pdfToText(buffer);
                if (typeof result === 'string') {
                    console.log(`PDF extraction completed. Text length: ${result.length}`);
                    console.log("First 200 characters of extracted text:", result.substring(0, 200));
                    return result;
                }
                else {
                    throw new Error("Unexpected result from pdfToText");
                }
            }
            catch (error) {
                console.error("Error extracting text from PDF:", error);
                throw new Error("Failed to extract text from PDF");
            }
        });
    }
};
exports.PDFExtractor = PDFExtractor;
exports.PDFExtractor = PDFExtractor = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], PDFExtractor);
