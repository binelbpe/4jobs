"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const securityHeaders = (req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
};
exports.default = securityHeaders;
