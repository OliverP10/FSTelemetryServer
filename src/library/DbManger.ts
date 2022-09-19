import mongoose from 'mongoose';
import { Logger } from 'winston';
import { BuildLogger } from './Logger';
import { DatabaseConnectionError } from '../errors/DatabaseConnectionError';

export class DbManager {
    logger: Logger;
    uri: string;
    connected: boolean;
    db: mongoose.Connection;
    constructor() {
        this.logger = BuildLogger('DbManager');
        this.uri = 'mongodb://localhost:27017/TelemetryDisplay';
        this.connected = false;
        mongoose
            .connect(this.uri, { retryWrites: true, w: 'majority', autoIndex: true })
            .then(() => {
                this.logger.info('connected');
                this.connected = true;
            })
            .catch((error) => {
                this.logger.error('Unable to connect');
            });
        this.db = mongoose.connection;
        this.db.on('error', this.logger.error.bind('MongoDB connection error'));
    }

    get database(): mongoose.Connection {
        return this.db;
    }
}
