import {body, param, check, validationResult} from "express-validator";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { Request, Response, NextFunction } from 'express';

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

    // Middleware to check for validation errors
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


export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
        return res.status(400).json({ error: 'File must be provided' });
    }

    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('application/zip')) {
        return res.status(400).json({ error: 'File format not supported' });
    }

    next();
}

// Definisci i middleware di validazione per l'email e i token
export const validateRechargeRequest = [
    body('email').isEmail().normalizeEmail(),
    body('tokensToAdd').isInt({ min: 1 }).toInt()
];

// Middleware for validating the body content (string not null)
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


