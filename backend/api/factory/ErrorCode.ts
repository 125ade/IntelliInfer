import {SuccessResponse} from "../utils/utils";

export abstract class ErrorCode {
    abstract set(message: string): ErrorCode;
    abstract send(response: any): ErrorCode;
}
  
/** 
* Server Error Class
*/
export class ServerError extends ErrorCode {
    private message!: SuccessResponse;
  
    set(message: string): ErrorCode {
      this.message = {
          success: false,
          message: message,
      };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(500).send(this.message);
      return this;
    }
    
    // error on the creation of an item
    setFailedCreationItem(): ErrorCode {
      return this.set("Error on creating item.");
    }
    
    // error on the update of an item
    setFailedUpdatingItem(): ErrorCode {
      return this.set("Error on updating item.");
    }
    
    // error on the elimination of an item
    setFailedDeleteItem(): ErrorCode {
      return this.set("Error on deleting item.");
    }

    // connection error
    setFailedConnection(): ErrorCode {
        return this.set("There was an error connecting to the database.")
    }

    // error on the upload of a file
    setFailedUploadFile(): ErrorCode {
      return this.set("There was an error uploading the file.")
    }

    // error on the generation of a token
    setFailedGenToken(): ErrorCode {
      return this.set("Failed creation token.")
    }

    // error on the creation of a repository
    setFailedCreationRepo(): ErrorCode {
      return this.set("Error. Dataset path must be provided")
    }
    
    // error on the return of an item
    setFailedRetriveItem() {
        return this.set("Error. Item can not be provided")
    }
    
    // error on the start of an inference operation
    setFailedStartInference() {
        return this.set("Error. Inference can't start")
    }
    
    // error on the creation of the result of an inference
    setFailedCreationResult() {
        return this.set("Error. Inference result can't be created");
    }

    setFailedCheckStatus() {
        return this.set("Error. impossible to check the status of the job");
    }
}

/**
 * Authentication Error Class
 */  
export class AuthenticationError extends ErrorCode {
    private message!: object;
  
    set(message: string): ErrorCode {
      this.message = {
          success: false,
          message: message,
      };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(401).send(this.message);
      return this;
    }
    
    // error for giving an invalid token
    setInvalidToken(): ErrorCode {
        return this.set("Authentication failed. Token is invalid.");
    }

    // error for the lack of a token
    setNoToken(): ErrorCode {
        return this.set("Authentication failed. Token must be provided.");
    }
    
    // error given by wrong role of the user
    setNotRightRole(): ErrorCode {
      return this.set("Authentication failed. User have not the right role to use the resource");
    }

    // error given by expiration of the token
    setTokenExpired(): ErrorCode {
      return this.set("Authentication failed. Token has already expired");
    }
    
    // error given by an invalid signature
    setInvalidSignature(): ErrorCode {
        return this.set("Authentication failed. Token signature is invalid.");
    }

    // error on the authentication of a user
    setFailAuthUser(): ErrorCode {
        return this.set("Authentication failed.");
    }
}


/**
 * Bad Request Error Class
 */
export class BadRequestError extends ErrorCode {
    private message!: object;
  
    set(message: string): ErrorCode {
      this.message = {
          success: false,
          message: message,
      };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(400).send(this.message);
      return this;
    }
    
    // error given by absence of a file to upload 
    setAbsentFile(): ErrorCode {
      return this.set("There was an error. File must be provided.");
    }
    
    // error given by absence of dataset's id
    setNoDatasetId(): ErrorCode {
        return this.set("There was an error. DatasetId must be provided.");
    }

    // error given by absence of user's id
    setNoUserId(): ErrorCode {
        return this.set("There was an error. User Id must be provided.");
    }
    
    // error given by absence of token
    setMissingToken(): ErrorCode {
      return this.set("There was an error. Token must be provided.");
    }
    
    // error given when the file the user wants to upload is not supported (no image or zip)
    setNotSupportedFile(): ErrorCode {
      return this.set("There was an error. File format not supported.");
    }
    
    // error given by absence of email
    setMissingEmail(): ErrorCode {
      return this.set("There was an error. User email not found.");
    }
    
    // error given by absence of model's id
    setNoModelId() {
        return this.set("There was an error. Model id not found.");
    }

    setNoJobId() {
        return this.set("There was an error. Job id not found.");
    }

    setNoImageId() {
        return this.set("Value must be a number greater than or equal to 0 or the string \"all\" for see all the frame");
    }
}

/**
 * Forbidden Error Class
 */
export class ForbiddenError extends ErrorCode {
    private message!: object;
  
    set(message: string): ErrorCode {
      this.message = {
          success: false,
          message: message,
      };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(403).send(this.message);
      return this;
    }
    
    // error given by insufficient tokens to make an operation
    setInsufficientToken(): ErrorCode{
      return this.set(`you need more tokens for this operation`);
    }
    
    // error given when the user wants to update the name of a dataset but the name is already used by one other
    setInvalidName(): ErrorCode{
      return this.set('There was an error. You have already a dataset with this name.');
    }
}

/**
 * Not Found Error Class
 */
export class NotFoundError extends ErrorCode {
    private message!: object;
  
    set(message: string): ErrorCode {
      this.message = {
          success: false,
          message: message,
      };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(404).send(this.message);
      return this;
    }
    
    // error given by absence of a model
    setAbstentModel(): ErrorCode{
      return this.set("Absent model");
    }
    
    // error given by absence of a dataset
    setAbstentDataset(): ErrorCode{
        return this.set("Absent dataset");
    }
    
    // error given by absence of a route on routes defined
    setNoRoute(): ErrorCode{
        return this.set("No route found.");
    }
    
    // error given when impossible to find a result
    setAbsentResults(): ErrorCode{
        return this.set("The requested results could not be found.");
    }
    
    // error given by absence of a user
    setNoUser(): ErrorCode {
      return this.set("user not found");
  }
    
    // error given by absence of a user
    setAbsentItems(): ErrorCode {
      return this.set("Impossible to find the required items.");
  }

    // error given when the user wants to visualize the state of an inference but it's impossible to find it
    setNonExistentInference(): ErrorCode {
        return this.set("There was an error. The inference process required is not existent. Unable to find its state.")
    }

    setJobNotFound() {
        return this.set("Impossible to find the job.");
    }
}