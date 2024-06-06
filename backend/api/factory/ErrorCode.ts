export abstract class ErrorCode {
    abstract set(message: string): ErrorCode;
    abstract send(response: any): ErrorCode;
}
  
/** 
* Server Error Class
*/
export class ServerError extends ErrorCode {
    private message!: Object;
  
    set(message: string): ErrorCode {
      this.message = { error: message };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(500).send(this.message);
      return this;
    }
    
    // errore: creazione di un dataset già esistente nel database
    setAlreadyCreatedDataset(): ErrorCode {
      return this.set("There was an error. The created dataset already exists.");
    }
    
    // errore: caricamento di un file giù esistente nel database
    setAlreadyUploadedFile(): ErrorCode {
        return this.set("There was an error. Already uploaded file.");
    }
    
    // errore nell'aggiornamento dei token 
    setUpdatingToken(): ErrorCode {
      return this.set("Error on updating token");
    }

    setFailedCreationItem(): ErrorCode {
      return this.set("Error on creating item");
    }

    setFailedUpdatingItem(): ErrorCode {
      return this.set("Error on updating item");
    }

    setFailedDeleteItem(): ErrorCode {
      return this.set("Error on deleting item");
    }

    // errore nella connessione al database
    setFailedConnection(): ErrorCode {
        return this.set("There was an error connecting to the database.")
    }

    // errore durante l'upload di un file
    setFailedUploadFile(): ErrorCode {
      return this.set("There was an error uploading the file.")
    }

    // errore nella connessione al database
    setFailedGenToken(): ErrorCode {
      return this.set("failed creation token.")
    }


    // errore nella connessione al database
    setFailedCreationRepo(): ErrorCode {
      return this.set("Error. Dataset path must be provided")
    }

    setFailedRetriveItem() {
        return this.set("Error. Item can not be provided")
    }
}

/**
 * Authentication Error Class
 */  
export class AuthenticationError extends ErrorCode {
    private message!: Object;
  
    set(message: string): ErrorCode {
      this.message = { error: message };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(401).send(this.message);
      return this;
    }
    
    // token invalido
    setInvalidToken(): ErrorCode {
        return this.set("Authentication failed. Token is invalid.");
    }
    // token invalido
    setNoToken(): ErrorCode {
        return this.set("Authentication failed. Token is not provided.");
    }

    setNotAdmin(): ErrorCode {
      return this.set("Authentication failed. User is not the admin");
    }

    setNotRightRole(): ErrorCode {
      return this.set("Authentication failed. User not have the right role to use the resource");
    }

    // token scaduto
    setTokenExpired(): ErrorCode {
      return this.set("Authentication failed. Token has expired");
    }
    
    // firma non valida
    setInvalidSignature(): ErrorCode {
        return this.set("Authentication failed. Token signature is invalid.");
    }
    
    // chiave invalida
    setInvalidKey(): ErrorCode {
        return this.set("Authentication failed. Key is invalid.");
    }

    //Failed to authenticate user
    setFailAuthUser(): ErrorCode {
        return this.set("Authentication failed. Failed to authenticate user.");
    }

    // chiave invalida
    setNotSystem(): ErrorCode {
      return this.set("Authentication failed. No System.");
  }
}


/**
 * Bad Request Error Class
 */
export class BadRequestError extends ErrorCode {
    private message!: Object;
  
    set(message: string): ErrorCode {
      this.message = { error: message };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(400).send(this.message);
      return this;
    }
    
    // Immagine non valida (controllo mimetype?)
    setInvalidImages(): ErrorCode {
        return this.set("There was an error. Images not valid.");
      }
    
    // file da caricare assente 
    setAbsentFile(): ErrorCode {
      return this.set("There was an error. An image or zip file must be provided.");
    }

    // file da caricare assente 
    setAbsentBody(): ErrorCode {
      return this.set("There was an error. Body request must be provided.");
    }
    
    // l'immagine è già stata sottoposta a inferenza
    setInferredImage() {
      return this.set("The image has already an inference.");
    }
    
    // bisogna specificare l'id del dataset nella richiesta
    setNoDatasetId(): ErrorCode {
        return this.set("There was an error. DatasetId must be provided.");
    }
    
    // bisogna specificare l'id dei risultati nella richiesta
    setNoResultId(): ErrorCode {
        return this.set("There was an error. ResultId must be provided.");
    }

    // bisogna specificare l'id dell'utente nella richiesta
    setNoUserId(): ErrorCode {
        return this.set("There was an error. User Id must be provided.");
    }

    setMissingToken(): ErrorCode {
      return this.set("There was an error. Token must be provided.");
    }

    setMissingKey(): ErrorCode {
      return this.set("There was an error. Key must be provided.");
    }

    setNotSupportedFile(): ErrorCode {
      return this.set("There was an error. File format not supported.");
    }

    setMissingEmail(): ErrorCode {
      return this.set("There was an error. User email not found.");
    }


}

/**
 * Forbidden Error Class
 */
export class ForbiddenError extends ErrorCode {
    private message!: Object;
  
    set(message: string): ErrorCode {
      this.message = { error: message };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(403).send(this.message);
      return this;
    }
  
    setInsufficientToken(): ErrorCode{
      return this.set(`you need more tokens for this operation`);
    }

    setWrongEmail(): ErrorCode{
      return this.set('Invalid Email');
    }
}

/**
 * Not Found Error Class
 */
export class NotFoundError extends ErrorCode {
    private message!: Object;
  
    set(message: string): ErrorCode {
      this.message = { error: message };
      return this;
    }
  
    send(response: any): ErrorCode {
      response.status(404).send(this.message);
      return this;
    }
  
    setAbstentModel(): ErrorCode{
      return this.set("Absent model");
    }

    setAbstentDataset(): ErrorCode{
        return this.set("Absent dataset");
    }

    setNoRoute(): ErrorCode{
        return this.set("No route found.");
    }

    setAbsentResults(): ErrorCode{
        return this.set("The requested results could not be found.");
    }

    setAbsentTag(): ErrorCode{
      return this.set("The requested tags could not be found.");
  }

    setNoEmail(): ErrorCode {
        return this.set("Email not existent.");
    }

    setNoUser(): ErrorCode {
      return this.set("user not found");
  }

    setAbsentItems(): ErrorCode {
      return this.set("Impossible to find the required items.");
  }

    // errore: richiesta dello stato di un'operazione di inferenza non in corso
    setNonExistentInference(): ErrorCode {
        return this.set("There was an error. The inference process required is not existent. Unable to find its state.")
    }
}