import { Request, Response, NextFunction } from 'express';
import { ConcreteErrorCreator} from "../factory/ErrorCreator";
import {decodeToken, ITokenPayload, validateToken} from '../token'
import {UserRole} from "../static";

declare module 'express' {
    export interface Request {
        userEmail?: string;
        userRole?: string;
    }
}

export const verifyTokenSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
        let jwt: string | undefined = req.headers.authorization;


        if (!jwt) {
          next(new ConcreteErrorCreator().createAuthenticationError().setInvalidToken().send(res));

        }

        if (jwt && jwt.toLowerCase().startsWith('bearer')) {
          jwt = jwt.slice('bearer'.length).trim();
          await validateToken(jwt);
          next();
        } else {
          next(new ConcreteErrorCreator().createAuthenticationError().setInvalidSignature().send(res));

        }
  } catch (error: any) {
    next(new ConcreteErrorCreator().createAuthenticationError().setInvalidToken().send(res));

  }
};

export const verifyUserRole =  (allowedAccessTypes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const jwt: string | undefined = req.headers.authorization
        if(jwt !== undefined) {
            const token: string = jwt.slice('bearer'.length).trim()
            const decodedToken: any = decodeToken(token);

            const hasAccessToEndpoint: boolean = allowedAccessTypes.includes(decodedToken.role);

            if (hasAccessToEndpoint) {
                req.userEmail = decodedToken.userEmail;
                req.userRole = decodedToken.role;
                return next();
            } else {
                return next(new ConcreteErrorCreator().createAuthenticationError().setNotRightRole().send(res));
            }
        }
    } catch (error) {
      return next(new ConcreteErrorCreator().createAuthenticationError().setFailAuthUser().send(res));
    }
  };
};


export const verifyTokenExpiration =  (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwt: string | undefined = req.headers.authorization
        if(jwt !== undefined) {
            const token: string = jwt.slice('bearer'.length).trim()
            const decodedToken: any = decodeToken(token);

            if (decodedToken.exp * 1000 < Date.now()) {
                next(new ConcreteErrorCreator().createAuthenticationError().setTokenExpired().send(res));
            } else {
                next();
            }
        }
  } catch (error) {
    next(new ConcreteErrorCreator().createAuthenticationError().setFailAuthUser().send(res));
  }
};

export const AuthUser = [
    verifyTokenSignature,
    verifyTokenExpiration,
    verifyUserRole([UserRole.USER,]),
]

export const AuthAdmin = [
    verifyTokenSignature,
    verifyTokenExpiration,
    verifyUserRole([UserRole.ADMIN,]),
]

export const AuthSystem = [
    verifyTokenSignature,
    verifyTokenExpiration,
    verifyUserRole([UserRole.ADMIN,]),
]

export const AuthMix= (arrayRole: string[])=> {
    return [
        verifyTokenSignature,
        verifyTokenExpiration,
        verifyUserRole(arrayRole),
    ]
}