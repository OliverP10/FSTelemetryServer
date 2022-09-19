import { SocketIo } from './library/SocketIo';
import { BuildLogger } from './library/Logger';
import { Logger } from 'winston';
import { DataManager } from './library/DataManager';
import { DbManager } from './library/DbManger';
import { ExpressApi } from './library/ExpressApi';

const logger: Logger = BuildLogger('Server');

logger.info('Server starting');
const api = new ExpressApi();
const dbManager = new DbManager();
const dataManager = new DataManager();
const sioServer = new SocketIo(3000, dataManager);

logger.info('Server Running');
