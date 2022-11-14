import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Telemetry, { ITelemetry } from '../models/Telemetry';
import { DbManager } from '../library/DbManger';
import { DataManager } from '../library/DataManager';

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Telemetry.find()
        .then((telemetry) => res.status(200).json({ telemetry }))
        .catch((error) => res.status(500).json({ error }));
};

const readAllFromSessionStart = (req: Request, res: Response, next: NextFunction) => {
    return Telemetry.find({
        timestamp: {
            $gte: DbManager.sessionStart
        }
    })
        .then((telemetry) => res.status(200).json({ telemetry }))
        .catch((error) => res.status(500).json({ error }));
};

const readLatestTelemetry = (req: Request, res: Response, next: NextFunction) => {
    const labelName = req.params.labelName;
    return Telemetry.findOne({
        timestamp: { $gte: DbManager.sessionStart },
        label: labelName
    })
        .sort({ timestamp: -1 })
        .then((telemetry) => res.status(200).json({ telemetry }))
        .catch((error) => res.status(500).json({ error }));
};

const readAllUniqueFromSessionStart = (req: Request, res: Response, next: NextFunction) => {
    const telemetry: ITelemetry[] = [];
    DataManager.latestTelemetry.forEach((telem) => telemetry.push(telem));
    return res.status(200).json({ telemetry: telemetry });
};

const readAllLabelsFromSessionStart = (req: Request, res: Response, next: NextFunction) => {
    const labels: string[] = [];
    Array.from(DataManager.latestTelemetry.keys()).forEach((label) => labels.push(label));
    return res.status(200).json({ labels: labels });
};

const readRange = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params);
    const from = new Date(req.params.from);
    const to = new Date(req.params.to);
    return Telemetry.find({
        timestamp: {
            $gte: from,
            $lt: to
        }
    })
        .then((telemetry) => res.status(200).json({ telemetry }))
        .catch((error) => {
            res.status(500).json({ error });
            console.log(error);
        });
};

export default { readAll, readAllFromSessionStart, readLatestTelemetry, readAllUniqueFromSessionStart, readAllLabelsFromSessionStart, readRange };
