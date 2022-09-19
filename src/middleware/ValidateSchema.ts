import Joi, { ObjectSchema } from 'Joi';
import { NextFunction, Response, Request } from 'express';
import { ILabelBoundry, ILabelMapping } from '../models/LabelMappings';
import { IScreenItem } from '../models/ScreenItem';
import { IDisplay } from '../models/Display';

export const ValidateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            //add logging
            console.log('Joi validation error');
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    labelMapping: {
        create: Joi.object<ILabelMapping>({
            label: Joi.string()
                .regex(/^[a-zA-Z0-9_]*$/)
                .required(),
            functionName: Joi.string(),
            params: Joi.object(),
            nominalBoundry: Joi.object<ILabelBoundry>({
                from: Joi.number().required(),
                to: Joi.number().required()
            }),
            warningBoundry: Joi.array().items(
                Joi.object<ILabelBoundry>({
                    from: Joi.number().required(),
                    to: Joi.number().required()
                })
            )
        }),
        update: Joi.object<ILabelMapping>({
            label: Joi.string().regex(/^[a-zA-Z0-9_]*$/),
            functionName: Joi.string(),
            params: Joi.object(),
            nominalBoundry: Joi.object<ILabelBoundry>({
                from: Joi.number().required(),
                to: Joi.number().required()
            }),
            warningBoundry: Joi.array().items(
                Joi.object<ILabelBoundry>({
                    from: Joi.number().required(),
                    to: Joi.number().required()
                })
            )
        })
    },
    display: {
        create: Joi.object<IDisplay>({
            title: Joi.string().required(),
            type: Joi.string().required(),
            colSize: Joi.number().greater(0).less(5).required(),
            rowSize: Joi.number().greater(0).less(5).required(),
            labels: Joi.array().items(Joi.string()).required(),
            options: Joi.object().required()
        }),
        update: Joi.object<IDisplay>({
            title: Joi.string(),
            type: Joi.string(),
            colSize: Joi.number().greater(0).less(5),
            rowSize: Joi.number().greater(0).less(5),
            labels: Joi.array().items(Joi.string()),
            options: Joi.object()
        })
    },
    screenItem: {
        create: Joi.object<IScreenItem>({
            location: Joi.string().required(),
            display: Joi.string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .required(),
            colSize: Joi.number().greater(0).less(5).required(),
            rowSize: Joi.number().greater(0).less(5).required(),
            options: Joi.object().required()
        }),
        update: Joi.object<IScreenItem>({
            location: Joi.string(),
            display: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
            colSize: Joi.number().greater(0).less(5),
            rowSize: Joi.number().greater(0).less(5),
            options: Joi.object()
        })
    }
};
