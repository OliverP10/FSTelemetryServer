import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Telemetry from '../models/Telemetry';

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Telemetry.find()
        .then((telemetry) => res.status(200).json({ telemetry }))
        .catch((error) => res.status(500).json({ error }));
};

export default { readAll };
