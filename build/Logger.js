"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildLogger = void 0;
const winston_1 = require("winston");
const { timestamp, combine, printf, errors, label } = winston_1.format;
function BuildLogger(name) {
    const logFormat = printf(({ level, message, label, timestamp, stack }) => {
        return `[${timestamp}] [${level}] [${label}] ${stack || message}`;
    });
    return (0, winston_1.createLogger)({
        format: combine(winston_1.format.colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), label({ label: name }), logFormat),
        transports: [new winston_1.transports.Console()],
    });
}
exports.BuildLogger = BuildLogger;
