import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { DbManager } from '../library/DbManger';
import Event from '../models/Event';

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Event.find()
        .then((event) => res.status(200).json({ event }))
        .catch((error) => res.status(500).json({ error }));
};

const readAllFromSessionStart = (req: Request, res: Response, next: NextFunction) => {
    return Event.find({
        timestamp: {
            $gte: DbManager.sessionStart
        }
    })
        .then((event) => res.status(200).json({ event }))
        .catch((error) => res.status(500).json({ error }));
};

const readRange = (req: Request, res: Response, next: NextFunction) => {
    const from = new Date(req.params.from);
    const to = new Date(req.params.to);
    return Event.find({
        timestamp: {
            $gte: from,
            $lt: to
        }
    })
        .then((events) => res.status(200).json({ events }))
        .catch((error) => res.status(500).json({ error }));
};

export default { readAll, readAllFromSessionStart, readRange };
