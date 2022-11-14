import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Screen from '../models/Screen';

const readScreen = (req: Request, res: Response, next: NextFunction) => {
    const screenName = req.params.screenName;
    return Screen.findOne({ name: screenName })
        .populate('screenItems')
        .then((screen) => (screen ? res.status(200).json({ screen }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Screen.find()
        .populate({ path: 'screenItems', populate: { path: 'display' } })
        .then((screen) => res.status(200).json({ screen }))
        .catch((error) => res.status(500).json({ error }));
};

const updateScreen = (req: Request, res: Response, next: NextFunction) => {
    const screenName = req.params.screenName;
    return Screen.findOne({ name: screenName })
        .then((screen) => {
            if (screen) {
                screen.set(req.body);

                return screen
                    .save()
                    .then((screen) => res.status(201).json({ screen }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                return res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

export default { readScreen, updateScreen, readAll };
