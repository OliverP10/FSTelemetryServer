import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Event.find()
        .then((event) => res.status(200).json({ event }))
        .catch((error) => res.status(500).json({ error }));
};

export default { readAll };
