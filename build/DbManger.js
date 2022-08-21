"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbManager = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Logger_1 = require("./Logger");
class DbManager {
    constructor() {
        this.logger = (0, Logger_1.BuildLogger)("DbManager");
        this.uri = "mongodb://localhost:27017/TelemetryDisplay";
        this.connected = false;
        mongoose_1.default.connect(this.uri, { retryWrites: true, w: 'majority' })
            .then(() => {
            this.logger.info("connected");
            this.connected = true;
        })
            .catch(error => {
            this.logger.error("Unable to connect");
        });
        this.db = mongoose_1.default.connection;
        this.db.on("error", this.logger.error.bind("MongoDB connection error"));
    }
}
exports.DbManager = DbManager;
