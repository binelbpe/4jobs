"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const containerMiddleware = (container) => {
    return (req, res, next) => {
        req.container = container;
        next();
    };
};
exports.default = containerMiddleware;
