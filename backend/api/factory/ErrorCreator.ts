import{
    AuthenticationError,
    BadRequestError,
    ForbiddenError,
    ServerError,
    NotFoundError,
    ErrorCode}
from './ErrorCode';
  
export interface ErrorCreator {
    createAuthenticationError(): ErrorCode;
  
    createBadRequestError(): ErrorCode;
  
    createServerError(): ErrorCode;
  
    createForbiddenError(): ErrorCode;

    createNotFoundError(): ErrorCode;
}
  
export class ConcreteErrorCreator implements ErrorCreator {
    createAuthenticationError(): AuthenticationError {
      return new AuthenticationError();
    }
  
    createBadRequestError(): BadRequestError {
      return new BadRequestError();
    }
  
    createServerError(): ServerError {
      return new ServerError();
    }
  
    createForbiddenError(): ForbiddenError {
      return new ForbiddenError();
    }

    createNotFoundError(): NotFoundError {
        return new NotFoundError();
    }
}