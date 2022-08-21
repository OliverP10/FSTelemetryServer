"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIOServer_1 = require("./SocketIOServer");
const Logger_1 = require("./Logger");
const DataManager_1 = require("./DataManager");
const DbManger_1 = require("./DbManger");
const logger = (0, Logger_1.BuildLogger)("Server");
logger.info("Server starting");
const dbManager = new DbManger_1.DbManager();
if (dbManager.connected) {
    const dataManager = new DataManager_1.DataManager(dbManager);
    const sioServer = new SocketIOServer_1.SocketIOServer(3000, dataManager);
    logger.info("Server Running");
}
else {
    logger.error("Unable to connect to databse, exiting...");
}
