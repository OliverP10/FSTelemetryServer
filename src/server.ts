import { Comunication } from './library/Comunication';
import { BuildLogger } from './library/Logger';
import { Logger } from 'winston';
import { DataManager } from './library/DataManager';
import { DbManager } from './library/DbManger';
import { ExpressApi } from './library/ExpressApi';
import { EchoServer } from './library/EchoServer';
import { UsbSerialReader } from './library/UsbSerialReader';

const logger: Logger = BuildLogger('Server');

logger.info('Server starting');
const api = new ExpressApi();
const dbManager = new DbManager();
const dataManager = new DataManager();
const sioServer = new Comunication();
const usbSerialReader = new UsbSerialReader('COM5', 9600);
const server = new EchoServer();

logger.info('Server Running');
