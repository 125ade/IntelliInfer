import { Request, Response, NextFunction } from 'express';

import {AuthenticationHandler, AuthorizationHandler, TokenValidationHandler} from "./auth.handler";

export function authMiddleware(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authenticationHandler: AuthenticationHandler = new AuthenticationHandler();
        const authorizationHandler: AuthorizationHandler = new AuthorizationHandler(...roles);
        const tokenValidationHandler:TokenValidationHandler = new TokenValidationHandler();

        // Configurare la catena
        authenticationHandler
            .setNext(tokenValidationHandler)
            .setNext(authorizationHandler);

        // Iniziare la catena
        authenticationHandler.handle({ req, res, next });
    };
}