import { NextFunction, Request, Response } from 'express';
import Display from '../models/Display';

const createDisplay = (req: Request, res: Response, next: NextFunction) => {
    //req.body['_id'] = new mongoose.Types.ObjectId();
    const display = new Display(req.body);
    return display
        .save()
        .then((display) => res.status(201).json({ display }))
        .catch((error) => res.status(500).json({ error }));
};

const readDisplay = (req: Request, res: Response, next: NextFunction) => {
    const displayId = req.params.displayId;
    return Display.findById(displayId)
        .then((display) => (display ? res.status(200).json({ display }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Display.find()
        .then((display) => res.status(200).json({ display }))
        .catch((error) => res.status(500).json({ error }));
};

const updateDisplay = (req: Request, res: Response, next: NextFunction) => {
    const displayId = req.params.displayId;
    return Display.findById(displayId)
        .then((display) => {
            if (display) {
                display.set(req.body);

                return display
                    .save()
                    .then((display) => res.status(201).json({ display }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                return res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteDisplay = (req: Request, res: Response, next: NextFunction) => {
    const displayId = req.params.displayId;
    //ScreenItem.deleteMany({display: displayId});
    return Display.findByIdAndDelete(displayId)
        .then((display) => (display ? res.status(201).json({ display, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default { createDisplay, readDisplay, updateDisplay, readAll, deleteDisplay };
