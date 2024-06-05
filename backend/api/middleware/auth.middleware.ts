import { Request, Response, NextFunction } from 'express';
import { ConcreteErrorCreator} from "../factory/ErrorCreator";
import {decodeToken, ITokenPayload, validateToken} from '../token'


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
      next(new ConcreteErrorCreator().createAuthenticationError().setInvalidToken().send(res));
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

            const hasAccessToEndpoint: boolean = allowedAccessTypes.some(
                (at: string): boolean => decodedToken.role === at
            );

            if (hasAccessToEndpoint) {
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



export const authorize = (allowedAccessTypes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let jwt: string | undefined = req.headers.authorization;

      // verify request has token
      if (!jwt) {
        next(new ConcreteErrorCreator().createAuthenticationError().setInvalidToken());
        //return res.status(401).json({ message: 'Invalid token ' });
      }

      // remove Bearer if using Bearer Authorization mechanism
      if (jwt !== undefined && jwt.toLowerCase().startsWith('bearer')) {
          jwt = jwt.slice('bearer'.length).trim();
          // verify token hasn't expired yet
          const decodedToken: ITokenPayload = await validateToken(jwt);

          const hasAccessToEndpoint: boolean = allowedAccessTypes.some(
              (at: string): boolean => decodedToken.role === at
          );
          if (!hasAccessToEndpoint) {
            next(new ConcreteErrorCreator().createAuthenticationError().setNotRightRole());
            //return res.status(401).json({message: 'No enough privileges to access endpoint'});
          }

          next();
      }

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
          next(new ConcreteErrorCreator().createAuthenticationError().setTokenExpired());
      }
        next(new ConcreteErrorCreator().createAuthenticationError().setFailAuthUser());
    }
  };
};

