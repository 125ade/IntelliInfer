import {body, param, check, validationResult} from "express-validator";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { Request, Response, NextFunction } from 'express';


// middleware used when giving a parameter to a request that must be integer and not null
export function validateParamIntGreaterThanZero(param_id: string) {
    return [
        param(param_id)
            .isInt({ gt: 0 }).withMessage('Value must be a number greater than 0'),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                new ConcreteErrorCreator()
                    .createBadRequestError()
                    .setNoUserId()
                    .send(res);
            } else {
                next();
            }
        }
    ];
}

export function validateParamIntFromZero(paramId: string) {
    return [
        param(paramId)
            .custom(value => {
                const numericValue: number = Number(value);
                if (!isNaN(numericValue) && numericValue >= 0) {
                    return true;
                }
                throw new ConcreteErrorCreator().createBadRequestError().setNoImageId();
            }),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(new ConcreteErrorCreator()
                    .createBadRequestError()
                    .setNoImageId()
                    .send(res));
            } else {
                next();
            }
        }
    ];
}


// middleware used when giving a parameter to a request that must be a valid UUID string
export function validateParamUUID(param_id: string) {
    return [
        param(param_id)
            .isString().withMessage('Value must be a valid string'),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                next(
                    new ConcreteErrorCreator()
                    .createBadRequestError()
                    .setNoJobId()
                    .send(res)
                );
            } else {
                next();
            }
        }
    ];
}

// middleware to validate the body of the route to create a dataset
export const validateCreateDataset = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    check('description')
        .notEmpty().withMessage('Description is required')
        .isString().withMessage('Description must be a string'),
    check('tags')
        .isArray({ min: 1 }).withMessage('Tags must be an array with at least one tag')
        .custom((tags: any[]) => {
            if (tags.some((tag: any) => typeof tag !== 'string')) {
                throw new Error('Each tag must be a string');
            }
            return true;
        }),

    
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            next(new ConcreteErrorCreator()
                .createBadRequestError()
                .setNoUserId()
                .send(res));
        } else {
            next();
        }
    }
];


// middleware to validate the mimetype of a file uploaded
export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
        return  new ConcreteErrorCreator().createBadRequestError().setAbsentFile().send(res);
    }

    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('application/zip')) {
        return  new ConcreteErrorCreator().createBadRequestError().setAbsentFile().send(res);
    }

    next();
}


// middleware to validate the body of the route to recharge user's credit
export const validateRechargeRequest = [
    body('email').isEmail().normalizeEmail(),
    body('tokensToAdd').isInt({ min: 1 }).toInt()
];


// Middleware for validating the body of the route to update the name of a dataset
export const validateName = [
    check('name')
        .isString().withMessage('Name must be a string')
        .notEmpty().withMessage('Name cannot be empty'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];


