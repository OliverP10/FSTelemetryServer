import { SocketIOServer } from "./SocketIOServer";
import { BuildLogger } from "./Logger";
import { Logger } from "winston";
import { DataManager } from "./DataManager";
import { DbManager } from "./DbManger";

const logger: Logger = BuildLogger("Server")

logger.info("Server starting")
const dbManager = new DbManager();
const dataManager = new DataManager(dbManager);
const sioServer = new SocketIOServer(3000, dataManager);
logger.info("Server Running");
