import serialport from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline'

import { Comunication } from './Comunication';
import { Logger } from 'winston';
import { BuildLogger } from './Logger';
import { IEvent } from '../models/Event';
import { DataManager } from './DataManager';

export class UsbSerialReader {
    private static logger: Logger;
    private static port: serialport;
    private static parser: ReadlineParser;

    constructor(devicePath: string, baudRate: number) {
        UsbSerialReader.logger = BuildLogger('UsbSerialReader');
        UsbSerialReader.port = new serialport(devicePath, { baudRate });

        UsbSerialReader.parser = UsbSerialReader.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

        UsbSerialReader.open();
        UsbSerialReader.parser.on('data', Comunication.recivedTelemetry);
        // UsbSerialReader.port.on('data', (data: Buffer) => {
        //     console.log(data.toString());
        // });
    }

    public static open(): void {
        UsbSerialReader.port.on('open', () => {
            UsbSerialReader.logger.info('Serial port open');
        });

        UsbSerialReader.port.on('close', () => {
            UsbSerialReader.logger.error('Serial port disconnected');
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverDisconnect', 'Serial port disconnected');
            Comunication.sendEvents([event]);
        });

        UsbSerialReader.port.on('error', (err) => {
            UsbSerialReader.logger.error(err.message);
            let event: IEvent = DataManager.createEvent('critical warning', 'server', 'receiverError', err.message);
            Comunication.sendEvents([event]);
        });
    }

    public static onData(callback: (data: Buffer) => void): void {
        UsbSerialReader.port.on('data', callback);
    }

    public static close(callback: (error?: Error | null) => void): void {
        UsbSerialReader.port.close(callback);
    }
}
