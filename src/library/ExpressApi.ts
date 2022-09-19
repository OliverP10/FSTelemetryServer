import { Logger } from 'winston';
import { BuildLogger } from './Logger';
import http from 'http';
import express from 'express';
import { config } from '../config/config';
import labelMappingRoutes from '../routes/LabelMapping';
import displayRoutes from '../routes/Display';
import screenItem from '../routes/ScreenItem';
import telemetry from '../routes/Telemetry';
import event from '../routes/Event';

export class ExpressApi {
    logger: Logger;
    router = express();

    constructor() {
        this.logger = BuildLogger('ExpressApi');
        this.setup();
    }

    private setup() {
        const startApi = () => {
            this.router.use((req, res, next) => {
                this.logger.info(`IP: ${req.socket.remoteAddress} Request: ${req.url} Type: ${req.method}`);
                res.on('finish', () => {
                    this.logger.info(`IP: ${req.socket.remoteAddress} Request: ${req.url} Type: ${req.method} Response: ${res.statusCode}`);
                });

                next();
            });
        };

        this.router.use(express.urlencoded({ extended: true }));
        this.router.use(express.json());

        // Api rules
        this.router.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

            if (req.method == 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
                return res.status(200).json({});
            }

            next();
        });

        // Routes
        this.router.use('/labelMappings', labelMappingRoutes);
        this.router.use('/display', displayRoutes);
        this.router.use('/screen', screenItem);
        this.router.use('/telemetry', telemetry);
        this.router.use('/event', event);

        // Ping
        this.router.get('/ping', (req, res, next) => res.status(200).json({ status: 'ok' }));

        // Erros
        this.router.use((req, res, next) => {
            const error = new Error('Endpoint not found');
            this.logger.error(error);
            res.status(404).json({
                message: error.message
            });
        });

        http.createServer(this.router).listen(config.api.port, () => this.logger.info(`Server is running on port ${config.api.port}`));
    }
}
