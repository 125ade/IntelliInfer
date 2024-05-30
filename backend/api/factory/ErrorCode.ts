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
    setAlreadyCreatedDataset(createdDataset: Object): ErrorCode {
      return this.set(
        "There was an error. The created dataset already exists: " +
          JSON.stringify(createdDataset)
      )
    }
    
    // errore: caricamento di un file giù esistente nel database
    setAlreadyUploadedFile(uploadedFile: Object): ErrorCode {
        return this.set(
            "There was an error. Already uploaded file: " +
             JSON.stringify(uploadedFile)
        )
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

    // errore nella connessione al database
    setFailedConnection(): ErrorCode {
        return this.set("There was an error connecting to the database.")
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
    
    // mancanza di token
    setMissingToken(): ErrorCode {
        return this.set("Authentication failed. Token is missing.");
    }
    
    // token invalido
    setInvalidToken(): ErrorCode {
        return this.set("Authentication failed. Token is invalid.");
    }
    
    setNotAdmin(): ErrorCode {
      return this.set("Authentication failed. User is not the admin");
    }
    
    // credito insufficiente
    setInsufficentToken(): ErrorCode {
      return this.set("Authentication failed. Token amount is 0");
    }
    
    // token scaduto
    setTokenExpired(): ErrorCode {
      return this.set("Authentication failed. Token has expired");
    }
    
    // firma non valida
    setInvalidSignature(): ErrorCode {
        return this.set("Authentication failed. Token signature is invalid.");
    }
    
    // chiave mancante
    setMissingKey(): ErrorCode {
        return this.set("Authentication failed. Key is missing.");
    }
    
    // chiave invalida
    setInvalidKey(): ErrorCode {
        return this.set("Authentication failed. Key is invalid.");
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
      return this.set("There was an error. An image or zip file must be provided");
    }
    
    setDuplicateImages(): ErrorCode {
      return this.set("There are duplicated entries on images");
    }
    
    // l'immagine è già stata sottoposta a inferenza
    setInferredImage(imageId: number, inference: any) {
      return this.set(
        `image id ${imageId} has already an inference: ${inference}`
      );
    }
    
    // bisogna specificare l'id del dataset nella richiesta
    setNoDatasetId(): ErrorCode {
        return this.set("There was an error. DatasetId must be provided");
    }
    
    // bisogna specificare l'id dei risultati nella richiesta
    setNoResultId(): ErrorCode {
        return this.set("There was an error. ResultId must be provided");
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
  
    setNeedMoreToken(tokenAmout: number): ErrorCode{
      return this.set(`you need ${tokenAmout} tokens for this operation`);
    }
  
    setNotAccessible(id: Array<any>): ErrorCode {
      let ids = id.join(",");
      return this.set(`${ids} id(s) are not accessible`);
    }
  
    setUnreadableUrl(url: string): ErrorCode {
      return this.set(`unreadable url ${url}`);
    }
  
    setInvalidUrlResponse(url: string): ErrorCode {
      return this.set(`can't access to ${url}`);
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
      return this.set(`The requested model could not be found.`);
    }

    setAbstentDataset(): ErrorCode{
        return this.set(`The requested dataset could not be found.`);
    }
  
    setAbsentResults(): ErrorCode{
        return this.set(`The requested results could not be found.`);
    }

    setNoEmail(email: string): ErrorCode {
        return this.set(`user with email ${email} doesn't exist`);
    }

    setAbsentItems(): ErrorCode {
      return this.set(`Impossible to find the required items.`);
  }

    // errore: richiesta dello stato di un'operazione di inferenza non in corso
    setNonExistentInference(): ErrorCode {
        return this.set("There was an error. The inference process required is not existent. Unable to find its state.")
    }
}