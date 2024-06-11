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
                return new ConcreteErrorCreator()
                    .createBadRequestError()
                    .setNoUserId()
                    .send(res);
            }

            next();

        }
    ];
}

export function validateParamIntFromZero(paramId: string) {
    return [
        param(paramId)
            .isInt({ min: 0 }),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return new ConcreteErrorCreator()
                    .createBadRequestError()
                    .setNoImageId()
                    .send(res);
            }

            next();

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
            return new ConcreteErrorCreator()
                .createBadRequestError()
                .setNotSupportedElement()
                .send(res);
        }

        next();

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
    body('email')
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail(),
    body('tokensToAdd')
        .toInt()
        .isInt({ min: 1 }),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return new ConcreteErrorCreator().createBadRequestError().setNotSupportedElement().send(res);
        }
        next();
    }
];


// Middleware for validating the body of the route to update the name of a dataset
export const validateName = [
    check('name')
        .isString().withMessage('Name must be a string')
        .notEmpty().withMessage('Name cannot be empty'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return new ConcreteErrorCreator().createBadRequestError().setNotSupportedElement().send(res);
        }
        next();
    }
];


