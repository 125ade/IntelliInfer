import {param, validationResult} from "express-validator";
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