import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { vehicleType } from '../common';
import { DataManager } from './DataManager';
import { BuildLogger } from './Logger';
import { IEvent } from '../models/Event';
import { ProcessedData } from '../interfaces/dataManager';
import { environment } from '../config/config';
import { ITelemetry } from '../models/Telemetry';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export class Comunication {
    private logger: Logger;
    private socketIO: Server;
    private roverConnected: boolean;
    private wifiConnected: boolean;
    private rfConnected: boolean;
    private roverSocket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null = null;

    constructor() {
        this.logger = BuildLogger('SocketIO');
        this.socketIO = new Server(environment.socket.port, {
            cors: {
                origin: '*'
            }
        });
        this.wifiConnected = false;
        this.rfConnected = false;
        this.roverConnected = false;
        this.setup();
        this.logger.info(`Server listening on port ${environment.socket.port}.`);
    }

    private setup() {
        this.socketIO.on('connection', (socket: Socket) => {
            socket.on('setType', (type) => {
                if (type === 'client') {
                    socket.join('clients');
                    this.socketIO.to(socket.id).emit('vehicle-connection', this.roverConnected);
                    console.log('Clinet conected');
                } else if (type === 'vehicle') {
                    this.roverSocket = socket;
                    socket.join('vehicle');
                    this.setWfifiConnectionStatus(true);
                    this.setConnectionStatus();
                }
            });

            socket.on('key-frame', (data) => {
                this.socketIO.to('vehicle').emit('key-frame', data);
            });

            socket.on('control-frame', (data) => {
                this.socketIO.to('vehicle').emit('control-frame', data);
            });

            socket.on('telemetry', (data: string) => {
                let processedData: ProcessedData = DataManager.addLiveData(data);
                this.socketIO.to('clients').emit('telemetry', processedData.telemetry);
                if (processedData.events.length > 0) {
                    this.socketIO.to('clients').emit('events', processedData.events);
                }
            });

            socket.on('log', (data) => {
                this.socketIO.to('clients').emit('log', data);
            });

            socket.on('disconnect', (data) => {
                if (socket == this.roverSocket) {
                    this.wifiConnected;
                    this.setWfifiConnectionStatus(false);
                    this.setConnectionStatus();
                }
            });
        });
    }

    public sendTelemetry(telemetry: ITelemetry) {
        this.socketIO.to('clients').emit('telemetry', telemetry);
    }

    public sendEvent(event: IEvent) {
        this.socketIO.to('clients').emit('event', event);
    }

    private setWfifiConnectionStatus(connected: boolean) {
        if (connected) {
            this.wifiConnected = true;
            let roverWifiEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has gained wifi conection');
            this.socketIO.to('clients').emit('vehicle-wifi-connection', true);
            this.socketIO.to('clients').emit('events', [roverWifiEvent]);
        } else {
            this.wifiConnected = false;
            let roverWifiEvent = DataManager.createEvent('warning', 'server', 'comunication', 'Rover has lost wifi conection');
            this.socketIO.to('clients').emit('vehicle-wifi-connection', false);
            this.socketIO.to('clients').emit('events', [roverWifiEvent]);
        }
    }

    private setRfConnectionStatus(connected: boolean) {
        if (connected) {
            this.rfConnected = true;
            let roverRfEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has gained rf conection');
            this.socketIO.to('clients').emit('vehicle-rf-connection', true);
            this.socketIO.to('clients').emit('events', [roverRfEvent]);
        } else {
            this.rfConnected = false;
            let roverRfEvent = DataManager.createEvent('warning', 'server', 'comunication', 'Rover has lost rf conection');
            this.socketIO.to('clients').emit('vehicle-rf-connection', false);
            this.socketIO.to('clients').emit('events', [roverRfEvent]);
        }
    }

    private setConnectionStatus() {
        let connected = this.wifiConnected || this.rfConnected ? true : false;
        if (this.roverConnected == connected) {
            return;
        }
        if (connected) {
            this.logger.info(`${vehicleType} connected`);
            this.roverConnected = true;
            let roverConnectEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has connected');
            this.socketIO.to('clients').emit('vehicle-connection', true);
            this.socketIO.to('clients').emit('events', [roverConnectEvent]);
        } else {
            this.logger.error(`${vehicleType} disconnected`);
            this.roverConnected = false;
            let roverDisconnectEvent = DataManager.createEvent('critical warning', 'server', 'comunication', 'Rover has disconnected');
            this.socketIO.to('clients').emit('vehicle-connection', false);
            this.socketIO.to('clients').emit('events', [roverDisconnectEvent]);
        }
    }
}
