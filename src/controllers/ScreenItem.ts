import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import ScreenItem from '../models/ScreenItem';

const createScreenItem = (req: Request, res: Response, next: NextFunction) => {
    //req.body['_id'] = new mongoose.Types.ObjectId();
    const screenItem = new ScreenItem(req.body);
    return screenItem
        .save()
        .then((screenItem) => res.status(201).json({ screenItem }))
        .catch((error) => res.status(500).json({ error }));
};

const readScreenItem = (req: Request, res: Response, next: NextFunction) => {
    const screenItemId = req.params.screenItemId;
    return ScreenItem.findById(screenItemId)
        .then((screenItem) => (screenItem ? res.status(200).json({ screenItem }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return ScreenItem.find()
        .then((screenItem) => res.status(200).json({ screenItem }))
        .catch((error) => res.status(500).json({ error }));
};

const updateScreenItem = (req: Request, res: Response, next: NextFunction) => {
    const screenItemId = req.params.screenItemId;
    return ScreenItem.findById(screenItemId)
        .then((screenItem) => {
            if (screenItem) {
                screenItem.set(req.body);

                return screenItem
                    .save()
                    .then((screenItem) => res.status(201).json({ screenItem }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                return res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteScreenItem = (req: Request, res: Response, next: NextFunction) => {
    const screenItemId = req.params.screenItemId;
    return ScreenItem.findByIdAndDelete(screenItemId)
        .then((screenItem) => (screenItem ? res.status(201).json({ screenItem, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default { createScreenItem, readScreenItem, updateScreenItem, readAll, deleteScreenItem };
