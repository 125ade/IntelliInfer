import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import fs from 'fs';
import * as process from 'node:process';
import {AbstractHandler} from "../handler";
let publicKey: string = ''
try{
    const publicKey_name: string = process.env.API_PUBLIC_KEY_NAME || 'test_purpose_public_key.pem';
    publicKey = fs.readFileSync(`secrets/${publicKey_name}`, 'utf8');
} catch (err) {
    throw err
}
export class AuthenticationHandler extends AbstractHandler {
    handle(request: any) {
        const req: Request = request.req;
        const res: Response = request.res;
        const next: NextFunction = request.next;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access token is missing' });
        }

        try {
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            (req as any).user = decoded;
            super.handle(request); // Pass the request to the next handler
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
}


export class AuthorizationHandler extends AbstractHandler {
    private roles: string[];

    constructor(...roles: string[]) {
        super();
        this.roles = roles;
    }

    handle(request: any) {
        const req: Request = request.req;
        const res: Response = request.res;
        const next: NextFunction = request.next;
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!this.roles.includes(user.role)) {
            return res.status(403).json({ message: 'User not authorized' });
        }

        super.handle(request); // Pass the request to the next handler
    }
}



export class TokenValidationHandler extends AbstractHandler {
    handle(request: any) {
        const req: Request = request.req;
        const res: Response = request.res;
        const next: NextFunction = request.next;

        // Assuming the token is already validated and user information is attached to req.user
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        super.handle(request); // Pass the request to the next handler
    }
}


