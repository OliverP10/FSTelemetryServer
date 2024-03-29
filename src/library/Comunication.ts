import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { ConnectionRoute, vehicleType } from '../common';
import { DataManager } from './DataManager';
import { BuildLogger } from './Logger';
import { IEvent } from '../models/Event';
import { ProcessedData } from '../interfaces/dataManager';
import { environment } from '../config/config';
import Telemetry, { ITelemetry } from '../models/Telemetry';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UsbSerial } from './UsbSerialReader';

export class Comunication {
    private static logger: Logger;
    private static socketIO: Server;
    private static roverConnected: boolean;
    private static wifiConnected: boolean;
    private static rfConnected: boolean;
    private static roverSocket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | null = null;
    private static connectionRoute: ConnectionRoute = 'wifi';

    constructor() {
        Comunication.logger = BuildLogger('Comunication');
        Comunication.socketIO = new Server(environment.socket.port, {
            cors: {
                origin: '*'
            }
        });
        Comunication.wifiConnected = false;
        Comunication.rfConnected = false;
        Comunication.roverConnected = false;
        Comunication.setup();
        Comunication.logger.info(`Server listening on port ${environment.socket.port}.`);
    }

    private static setup() {
        Comunication.socketIO.on('connection', (socket: Socket) => {
            socket.on('setType', (type) => {
                if (type === 'client') {
                    socket.join('clients');
                    Comunication.socketIO.to(socket.id).emit('vehicle-connection', Comunication.roverConnected);
                    Comunication.socketIO.to('clients').emit('connecntion-route', Comunication.connectionRoute);
                } else if (type === 'vehicle') {
                    Comunication.roverSocket = socket;
                    socket.join('vehicle');
                    Comunication.setWfifiConnectionStatus(true);
                }
            });

            socket.on('connecntion-route', (connecntionRoute: ConnectionRoute) => {
                Comunication.setConnectionRoute(connecntionRoute);
            });

            socket.on('control-frame', (data) => {
                if (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                //console.log(JSON.stringify(data));
                if (this.connectionRoute == 'wifi') {
                    Comunication.socketIO.to('vehicle').emit('control-frame', data);
                    // console.log('Sending wifi');
                } else if (this.connectionRoute == 'rf') {
                    UsbSerial.write(JSON.stringify(data));
                    // console.log('sending radio');
                }
            });

            socket.on('telemetry', (data: string) => {
                if (this.connectionRoute == 'wifi') {
                    Comunication.recivedTelemetry(data);
                }
            });

            socket.on('log', (data) => {
                Comunication.socketIO.to('clients').emit('log', data);
            });

            socket.on('disconnect', (data) => {
                if (socket == Comunication.roverSocket) {
                    Comunication.setWfifiConnectionStatus(false);
                }
            });
        });
    }

    public static recivedTelemetry(data: any) {
        let processedData: ProcessedData = DataManager.addLiveData(data.toString());
        Comunication.socketIO.to('clients').emit('telemetry', processedData.telemetry);
        if (processedData.events.length > 0) {
            Comunication.socketIO.to('clients').emit('events', processedData.events);
        }
    }



    public static sendTelemetry(telemetry: ITelemetry) {
        Comunication.socketIO.to('clients').emit('telemetry', telemetry);
    }

    public static sendEvents(events: IEvent[]) {
        Comunication.socketIO.to('clients').emit('events', events);
    }

    public static setWfifiConnectionStatus(connected: boolean) {
        if (connected) {
            Comunication.wifiConnected = true;
            let roverWifiEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has gained wifi conection');
            Comunication.socketIO.to('clients').emit('vehicle-wifi-connection', true);
            Comunication.socketIO.to('clients').emit('events', [roverWifiEvent]);
        } else {
            Comunication.wifiConnected = false;
            let roverWifiEvent = DataManager.createEvent('warning', 'server', 'comunication', 'Rover has lost wifi conection');
            Comunication.socketIO.to('clients').emit('vehicle-wifi-connection', false);
            Comunication.socketIO.to('clients').emit('events', [roverWifiEvent]);
        }
        this.setConnectionStatus();
    }

    public static setRfConnectionStatus(connected: boolean) {
        if (connected) {
            Comunication.rfConnected = true;
            let roverRfEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has gained rf conection');
            Comunication.socketIO.to('clients').emit('vehicle-rf-connection', true);
            Comunication.socketIO.to('clients').emit('events', [roverRfEvent]);
        } else {
            Comunication.rfConnected = false;
            let roverRfEvent = DataManager.createEvent('warning', 'server', 'comunication', 'Rover has lost rf conection');
            Comunication.socketIO.to('clients').emit('vehicle-rf-connection', false);
            Comunication.socketIO.to('clients').emit('events', [roverRfEvent]);
        }
        this.setConnectionStatus();
    }

    private static setConnectionStatus() {
        let connected = Comunication.wifiConnected || Comunication.rfConnected ? true : false;
        if (Comunication.roverConnected == connected) {
            return;
        }
        if (connected) {
            Comunication.logger.info(`${vehicleType} connected`);
            Comunication.roverConnected = true;
            let roverConnectEvent = DataManager.createEvent('info', 'server', 'comunication', 'Rover has connected');
            Comunication.socketIO.to('clients').emit('vehicle-connection', true);
            Comunication.socketIO.to('clients').emit('events', [roverConnectEvent]);
        } else {
            Comunication.logger.error(`${vehicleType} disconnected`);
            Comunication.roverConnected = false;
            let roverDisconnectEvent = DataManager.createEvent('critical warning', 'server', 'comunication', 'Rover has disconnected');
            Comunication.socketIO.to('clients').emit('vehicle-connection', false);
            Comunication.socketIO.to('clients').emit('events', [roverDisconnectEvent]);
        }
    }

    private static setConnectionRoute(route: ConnectionRoute) {
        Comunication.connectionRoute = route;
        Comunication.socketIO.to('clients').emit('connecntion-route', Comunication.connectionRoute);
    }

    public static getConnectionRoute() {
        return Comunication.connectionRoute;
    }
}
