import serialport from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

import { Comunication } from './Comunication';
import { Logger } from 'winston';
import { BuildLogger } from './Logger';
import { IEvent } from '../models/Event';
import { DataManager } from './DataManager';

export class UsbSerial {
    private static logger: Logger;
    private static port: serialport;
    private static parser: ReadlineParser;

    constructor() {
        let devicePath: string = 'COM3';
        let baudRate: number = 57600;
        UsbSerial.logger = BuildLogger('UsbSerial');
        UsbSerial.port = new serialport(devicePath, { baudRate });

        UsbSerial.parser = UsbSerial.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        UsbSerial.open();
        UsbSerial.parser.on('data', UsbSerial.sendTelemetry);
        // UsbSerialReader.port.on('data', (data: Buffer) => {
        //     console.log(data.toString());
        // });
    }

    private static sendTelemetry(data: any) {
        if(data == '{"0":1}'){
            Comunication.setRfConnectionStatus(true);
        } else if(data == '{"0":0}'){
            Comunication.setRfConnectionStatus(false);
        }
        
        if (Comunication.getConnectionRoute() == 'rf') {
            Comunication.recivedTelemetry(data);
        }
    }

    public static open(): void {
        UsbSerial.port.on('open', () => {
            UsbSerial.logger.info('Serial port open');
        });

        UsbSerial.port.on('close', () => {
            UsbSerial.logger.error('Serial port disconnected - restart server');
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverDisconnect', 'Serial port disconnected');
            Comunication.sendEvents([event]);
            UsbSerial.sendTelemetry('{"0":0}');
        });

        UsbSerial.port.on('error', (err) => {
            UsbSerial.logger.error(err.message);
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverError', err.message);
            Comunication.sendEvents([event]);
        });
    }

    public static write(controlFrame: string) {
        UsbSerial.port.write(controlFrame, function (err) {
            if (err) {
                return UsbSerial.logger.error('Error on write: ', err.message);
            }
        });
    }

    public static onData(callback: (data: Buffer) => void): void {
        UsbSerial.port.on('data', callback);
    }

    public static close(callback: (error?: Error | null) => void): void {
        UsbSerial.port.close(callback);
    }
}
