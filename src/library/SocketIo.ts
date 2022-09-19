import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { vehicleType } from '../common';
import { DataManager } from './DataManager';
import { BuildLogger } from './Logger';
import { IEvent } from '../models/Event';
import { ProcessedData } from '../interfaces/dataManager';

export class SocketIo {
    private logger: Logger;
    private port: number;
    private socketIO: Server;
    private dataManager: DataManager;

    constructor(port: number, dataManager: DataManager) {
        this.logger = BuildLogger('SocketIO');
        this.port = port;
        this.dataManager = dataManager;
        this.socketIO = new Server(this.port, {
            cors: {
                origin: '*'
            }
        });
        this.setup();
        this.logger.info(`Server listening on port ${this.port}.`);
    }

    private setup() {
        this.socketIO.on('connection', (socket: Socket) => {
            socket.on('setType', (type) => {
                if (type === 'client') {
                    socket.join('clients');
                } else if (type === 'vehicle') {
                    socket.join('vehicle');
                    this.logger.info(`${vehicleType} connected`);
                    this.socketIO.to('clients').emit('vehicle-connection', true);
                }
            });

            socket.on('key-frame', (data) => {
                this.socketIO.to('vehicle').emit('key-frame', data);
            });

            socket.on('control-frame', (data) => {
                this.socketIO.to('vehicle').emit('control-frame', data);
            });

            socket.on('live-telemetry', (data: string) => {
                let processedData: ProcessedData = this.dataManager.addLiveData(data);
                this.socketIO.to('clients').emit('live-telemetry', processedData.telemetry);
                this.socketIO.to('clients').emit('live-events', processedData.events);
            });

            socket.on('serial-port', (data) => {
                this.socketIO.to('clients').emit('serial-port', data);
            });

            socket.on('log', (data) => {
                this.socketIO.to('clients').emit('log', data);
            });

            socket.on('disconnect', (data) => {
                if (!this.socketIO.sockets.adapter.rooms.get('vehicle')) {
                    this.socketIO.to('clients').emit('vehicle-connection', false);
                    this.logger.warn(`${vehicleType} disconnected`);
                }
            });
        });
    }

    public sendEvent(event: IEvent) {
        this.socketIO.to('clients').emit('event', event);
    }
}
