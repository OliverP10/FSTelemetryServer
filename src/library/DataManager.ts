import { Logger } from 'winston';
import { LabelMapping, RawTelemetry } from '../interfaces/common';
import { DbManager } from './DbManger';
import { BuildLogger } from './Logger';
import LabelMappings, { ILabelMapping } from '../models/LabelMappings';
import { metadatMappings } from '../config/metadataMappings';
import Telemetry, { ITelemetryMetadata, ITelemetry } from '../models/Telemetry';
import { SocketIo } from './SocketIo';
import Event, { IEvent } from '../models/Event';
import { LinearConvertionParam, normalizeParam, OffsetParam, ProcessedData } from '../interfaces/dataManager';

export class DataManager {
    private logger: Logger;
    private labelMappings: Map<string, LabelMapping>;

    constructor() {
        this.logger = BuildLogger('DataManager');
        this.labelMappings = new Map<string, LabelMapping>();

        this.setup();
    }

    public setup() {
        this.updateLabelMappings();
        //LabelMappings.watch().on('change', (data) => this.updateLabelMappings());
    }

    private updateLabelMappings() {
        LabelMappings.find().then((labelMapping) => this.loadLabelMappings({ labelMapping }.labelMapping));
    }

    private loadLabelMappings(labelMappings: ILabelMapping[]) {
        for (let labelMapping of labelMappings) {
            this.labelMappings.set(labelMapping.label, {
                functionName: labelMapping.functionName,
                params: labelMapping.params,
                nominalBoundry: labelMapping.nominalBoundry,
                warningBoundry: labelMapping.warningBoundry
            });
        }
        console.log(this.labelMappings);
    }

    public addLiveData(telem: string): ProcessedData {
        let rawTelemetry: RawTelemetry = JSON.parse(telem);

        let formattedTelem: ITelemetry = {
            timestamp: new Date(),
            metadata: this.decodeId(rawTelemetry.i),
            value: rawTelemetry.d
        };
        formattedTelem.value = this.applyFunction(formattedTelem);
        const telemetry = new Telemetry(formattedTelem);
        telemetry.save().catch((error) => this.logger.error('Error while saving incoming telemetry'));
        return {
            telemetry: formattedTelem,
            events: this.checkBoundrys(formattedTelem)
        };
    }

    private decodeId(id: number): ITelemetryMetadata {
        return metadatMappings[id];
    }

    private checkBoundrys(telemetry: ITelemetry): IEvent[] {
        let events: IEvent[] = [];
        let lableMapping = this.labelMappings.get(telemetry.metadata.label);
        if (typeof lableMapping !== 'undefined') {
            if (telemetry.value < lableMapping.nominalBoundry.from || telemetry.value > lableMapping.nominalBoundry.to) {
                events.push(
                    this.createEvent(
                        'critical warning',
                        telemetry.metadata.location,
                        'nominalBoundCheck',
                        'Outside of nominal boundry of min:' + lableMapping.nominalBoundry.from + ' max:' + lableMapping.nominalBoundry.to + ' with value of:' + telemetry.value
                    )
                );
            }

            for (let warningBound of lableMapping.warningBoundry) {
                if (telemetry.value >= warningBound.from && telemetry.value <= warningBound.to) {
                    events.push(
                        this.createEvent(
                            'warning',
                            telemetry.metadata.location,
                            'warningBoundCheck',
                            'Inside of warning boundry of min:' + warningBound.from + ' max:' + warningBound.to + ' with value of:' + telemetry.value
                        )
                    );
                }
            }
        }
        return events;
    }

    private createEvent(type: string, location: string, trigger: string, message: string): IEvent {
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
    private applyFunction(telemetry: ITelemetry) {
        let lableMapping = this.labelMappings.get(telemetry.metadata.label);
        if (typeof lableMapping !== 'undefined') {
            const functionName = lableMapping.functionName;
            const params = lableMapping.params;
            const data = telemetry.value;

            switch (functionName) {
                case 'offset':
                    return this.offset(params, data);
                case 'normalize':
                    return this.normalize(params, data);
                case 'linearConvertion':
                    return this.linearConvertion(params, data);
                case 'boolToInt':
                    return this.booleanToInteger(data);
            }
        }
        return telemetry.value;
    }

    //just adds onto the data value
    private offset(params: OffsetParam, data: number) {
        return data + params.offsetBy;
    }

    //puts the data between 0 and 100
    private normalize(params: normalizeParam, data: number) {
        return (((data - params.min) / (params.max - params.min)) * params.multiplier).toFixed(2);
    }

    //puts data between a range
    private linearConvertion(params: LinearConvertionParam, data: number) {
        const oldRange = params.oldMax - params.oldMin;
        const newRange = params.newMax - params.newMin;
        return ((data - params.oldMin) * newRange) / oldRange + params.newMin;
    }

    private booleanToInteger(data: number) {
        if (!isNaN(data)) {
            return data;
        }
        return data ? 1 : 0;
    }
}
