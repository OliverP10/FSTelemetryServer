import { Logger } from 'winston';
import { LabelMapping, RawTelemetry } from '../interfaces/common';
import { DbManager } from './DbManger';
import { BuildLogger } from './Logger';
import LabelMappings, { ILabelMapping } from '../models/LabelMappings';
import { metadatMappings } from '../config/metadataMappings';
import Telemetry, { ITelemetryMetadata, ITelemetry } from '../models/Telemetry';
import { Comunication } from './Comunication';
import Event, { IEvent } from '../models/Event';
import { LinearConvertionParam, normalizeParam, OffsetParam, ProcessedData } from '../interfaces/dataManager';
import mongoose from 'mongoose';

export class DataManager {
    private static logger: Logger;
    private static labelMappings: Map<string, LabelMapping>;
    public static latestTelemetry: Map<string, ITelemetry>;

    constructor() {
        DataManager.logger = BuildLogger('DataManager');
        DataManager.labelMappings = new Map<string, LabelMapping>();
        DataManager.latestTelemetry = new Map<string, ITelemetry>();
        DataManager.setup();
    }

    public static setup() {
        DataManager.updateLabelMappings();
        //LabelMappings.watch().on('change', (data) => this.updateLabelMappings());
    }

    private static updateLabelMappings() {
        LabelMappings.find().then((labelMapping) => DataManager.loadLabelMappings({ labelMapping }.labelMapping));
    }

    private static loadLabelMappings(labelMappings: ILabelMapping[]) {
        for (let labelMapping of labelMappings) {
            DataManager.labelMappings.set(labelMapping.label, {
                functionName: labelMapping.functionName,
                params: labelMapping.params,
                nominalBoundry: labelMapping.nominalBoundry,
                warningBoundry: labelMapping.warningBoundry
            });
        }
    }

    public static addLiveData(telem: string): ProcessedData {
        let timeRecived = new Date();
        let rawTelemetry: any;

        try {
            rawTelemetry = JSON.parse(telem);
        } catch (err) {
            DataManager.logger.warn('Unable to parse telemetry: ' + (err as Error).message);
            let event: IEvent = DataManager.createEvent('warning', 'server', 'corruptedTelemetry', 'Unable to parse telemetry: ' + (err as Error).message);
            Comunication.sendEvents([event]);
        }

        let telemetryToSave: ITelemetry[] = [];
        let formattedTelemetry: ITelemetry[] = [];
        let events: IEvent[] = [];

        for (let key in rawTelemetry) {
            let formattedTelem: ITelemetry = {
                timestamp: timeRecived,
                metadata: this.decodeId(parseInt(key)),
                value: rawTelemetry[key]
            };
            formattedTelem.value = this.applyFunction(formattedTelem);
            events.push(...DataManager.checkBoundrys(formattedTelem));
            formattedTelemetry.push(formattedTelem);
            this.latestTelemetry.set(formattedTelem.metadata.label, formattedTelem);
            const telemetry = new Telemetry(formattedTelem);
            telemetryToSave.push(telemetry);
        }

        Telemetry.insertMany(telemetryToSave);

        return {
            telemetry: telemetryToSave,
            events: events
        };
    }

    private static decodeId(id: number): ITelemetryMetadata {
        return metadatMappings[id];
    }

    private static checkBoundrys(telemetry: ITelemetry): IEvent[] {
        let events: IEvent[] = [];
        let labelMapping = DataManager.labelMappings.get(telemetry.metadata.label);

        if (typeof labelMapping == 'undefined') {
            return events;
        }

        if (telemetry.value < labelMapping.nominalBoundry.from || telemetry.value > labelMapping.nominalBoundry.to) {
            events.push(
                this.createEvent(
                    'critical warning',
                    telemetry.metadata.location,
                    'nominalBoundCheck',
                    '"' +
                        telemetry.metadata.label +
                        '" outside of nominal boundry of min:' +
                        labelMapping.nominalBoundry.from +
                        ' max:' +
                        labelMapping.nominalBoundry.to +
                        ' with value of:' +
                        telemetry.value
                )
            );
        }

        for (let warningBound of labelMapping.warningBoundry) {
            if (telemetry.value >= warningBound.from && telemetry.value <= warningBound.to) {
                events.push(
                    this.createEvent(
                        'warning',
                        telemetry.metadata.location,
                        'warningBoundCheck',
                        '"' + telemetry.metadata.label + '" inside of warning boundry of min:' + warningBound.from + ' max:' + warningBound.to + ' with value of:' + telemetry.value
                    )
                );
            }
        }
        return events;
    }

    public static createEvent(type: string, location: string, trigger: string, message: string): IEvent {
        let formattedEvent: IEvent = {
            timestamp: new Date(),
            metadata: {
                type: type,
                location: location
            },
            trigger: trigger,
            message: message
        };
        const event = new Event(formattedEvent);
        event.save().catch((error) => this.logger.error('Error while saving Event'));
        return event;
    }

    //Will loop through each key in live data and apply the function mapped to it in the json
    private static applyFunction(telemetry: ITelemetry) {
        let lableMapping = this.labelMappings.get(telemetry.metadata.label);
        if (typeof lableMapping !== 'undefined') {
            const functionName = lableMapping.functionName;
            const params = lableMapping.params;
            const data = telemetry.value;

            switch (functionName) {
                case 'offset':
                    return DataManager.offset(params, data);
                case 'normalize':
                    return DataManager.normalize(params, data);
                case 'linearConvertion':
                    return DataManager.linearConvertion(params, data);
                case 'boolToInt':
                    return DataManager.booleanToInteger(data);
            }
        }
        return telemetry.value;
    }

    //just adds onto the data value
    private static offset(params: OffsetParam, data: number) {
        return data + params.offsetBy;
    }

    //puts the data between 0 and 100
    private static normalize(params: normalizeParam, data: number) {
        return (((data - params.min) / (params.max - params.min)) * params.multiplier).toFixed(2);
    }

    //puts data between a range
    private static linearConvertion(params: LinearConvertionParam, data: number) {
        const oldRange = params.oldMax - params.oldMin;
        const newRange = params.newMax - params.newMin;
        return ((data - params.oldMin) * newRange) / oldRange + params.newMin;
    }

    private static booleanToInteger(data: number) {
        if (!isNaN(data)) {
            return data;
        }
        return data ? 1 : 0;
    }
}
