"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionError = void 0;
class DatabaseConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConnectionError";
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
