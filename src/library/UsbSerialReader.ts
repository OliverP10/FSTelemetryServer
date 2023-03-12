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

    constructor(devicePath: string, baudRate: number) {
        UsbSerial.logger = BuildLogger('UsbSerial');
        UsbSerial.port = new serialport(devicePath, { baudRate });

        UsbSerial.parser = UsbSerial.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        UsbSerial.open();
        UsbSerial.parser.on('data', Comunication.recivedTelemetry);
        // UsbSerialReader.port.on('data', (data: Buffer) => {
        //     console.log(data.toString());
        // });
    }

    public static open(): void {
        UsbSerial.port.on('open', () => {
            UsbSerial.logger.info('Serial port open');
        });

        UsbSerial.port.on('close', () => {
            UsbSerial.logger.error('Serial port disconnected');
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverDisconnect', 'Serial port disconnected');
            Comunication.sendEvents([event]);
        });

        UsbSerial.port.on('error', (err) => {
            UsbSerial.logger.error(err.message);
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverError', err.message);
            Comunication.sendEvents([event]);
        });
    }

    public static write(controlFrame: string) {
        UsbSerial.parser.write(controlFrame, function (err) {
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
