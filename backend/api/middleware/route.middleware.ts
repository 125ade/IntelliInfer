import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { Request, Response, NextFunction } from 'express';

export const handleRouteNotFound = (req: Request, res: Response, next: NextFunction) => {
    new ConcreteErrorCreator()
        .createNotFoundError()
        .setNoRoute()
        .send(res);
};