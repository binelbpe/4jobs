"use strict";
// src/presentation/routes/securityTestRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRouter = void 0;
const express_1 = __importDefault(require("express"));
const hpp_1 = __importDefault(require("hpp"));
const testRouter = express_1.default.Router();
exports.testRouter = testRouter;
// Add to your securityTestRoutes.ts
testRouter.post('/advanced-xss-test', (req, res) => {
    const { userInput, htmlContent, urlParam } = req.body;
    res.json({
        sanitizedInput: userInput,
        sanitizedHtml: htmlContent,
        sanitizedUrl: urlParam
    });
});
// Add to your securityTestRoutes.ts
testRouter.post('/advanced-nosql-test', (req, res) => {
    const { query, filter, sort } = req.body;
    res.json({
        sanitizedQuery: query,
        sanitizedFilter: filter,
        sanitizedSort: sort
    });
});
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Add to your securityTestRoutes.ts
const requestCounts = new Map();
testRouter.get('/advanced-rate-limit/test1', (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }), (req, res) => {
    res.json({ message: 'Standard endpoint' });
});
testRouter.get('/advanced-rate-limit/test2', (0, express_rate_limit_1.default)({ windowMs: 1 * 60 * 1000, max: 10 }), (req, res) => {
    res.json({ message: 'Sensitive endpoint' });
});
testRouter.post('/advanced-rate-limit/burst', (0, express_rate_limit_1.default)({ windowMs: 1000, max: 3 }), (req, res) => {
    res.json({ message: 'Burst protection endpoint' });
});
// Add to your securityTestRoutes.ts
testRouter.post('/advanced-payload/json', express_1.default.json({ limit: '50mb' }), (req, res) => {
    res.json({ size: JSON.stringify(req.body).length });
});
testRouter.post('/advanced-payload/multipart', express_1.default.raw({ limit: '50mb' }), (req, res) => {
    res.json({ size: req.body.length });
});
testRouter.post('/advanced-payload/urlencoded', express_1.default.urlencoded({ extended: true, limit: '50mb' }), (req, res) => {
    res.json({ size: JSON.stringify(req.body).length });
});
// Add to your securityTestRoutes.ts
testRouter.get('/advanced-hpp/test', (0, hpp_1.default)(), (req, res) => {
    res.json({
        query: req.query,
        sanitized: true
    });
});
testRouter.post('/advanced-hpp/complex', (0, hpp_1.default)(), (req, res) => {
    res.json({
        body: req.body,
        sanitized: true
    });
});
// Add to your securityTestRoutes.ts
// Test XSS Protection
testRouter.post('/xss-test', (req, res) => {
    const { userInput } = req.body;
    res.json({
        sanitizedInput: userInput,
        message: 'Check if malicious scripts are removed'
    });
});
// Test NoSQL Injection
testRouter.get('/nosql-test', (req, res) => {
    const { email } = req.query;
    res.json({
        queryReceived: email,
        message: 'Check if NoSQL injection characters are sanitized'
    });
});
// Test Rate Limiting
testRouter.get('/rate-limit-test', (req, res) => {
    res.json({
        message: 'Request successful',
        timestamp: new Date().toISOString()
    });
});
// Test Large Payload
testRouter.post('/payload-test', (req, res) => {
    res.json({
        receivedDataSize: JSON.stringify(req.body).length,
        message: 'Payload size check'
    });
});
// Test HTTP Parameter Pollution
testRouter.get('/hpp-test', (req, res) => {
    const { param } = req.query;
    res.json({
        receivedParam: param,
        allParams: req.query
    });
});
