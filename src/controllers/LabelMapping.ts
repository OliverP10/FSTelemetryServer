import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import LabelMapping from '../models/LabelMappings';
import { DataManager } from '../library/DataManager';

const createLabelMapping = (req: Request, res: Response, next: NextFunction) => {
    req.body['_id'] = new mongoose.Types.ObjectId();
    const labelMapping = new LabelMapping(req.body);

    return labelMapping
        .save()
        .then((labelMapping) => res.status(201).json({ labelMapping }))
        .catch((error) => res.status(500).json({ error }));
};

const readLabelMapping = (req: Request, res: Response, next: NextFunction) => {
    const labelName = req.params.labelName;
    return LabelMapping.findOne({ label: labelName })
        .then((labelMapping) => (labelMapping ? res.status(200).json({ labelMapping }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return LabelMapping.find()
        .then((labelMapping) => res.status(200).json({ labelMapping }))
        .catch((error) => res.status(500).json({ error }));
};

const updateLabelMapping = (req: Request, res: Response, next: NextFunction) => {
    const labelName = req.params.labelName;

    return LabelMapping.findOne({ label: labelName })
        .then((labelMapping) => {
            if (labelMapping) {
                labelMapping.set(req.body);

                return labelMapping
                    .save()
                    .then((labelMapping) => res.status(201).json({ labelMapping }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                return res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteLabelMapping = (req: Request, res: Response, next: NextFunction) => {
    const labelName = req.params.labelName;
    return LabelMapping.findOneAndDelete({ label: labelName })
        .then((labelMapping) => (labelMapping ? res.status(201).json({ labelMapping, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default { createLabelMapping, readLabelMapping, updateLabelMapping, readAll, deleteLabelMapping };
