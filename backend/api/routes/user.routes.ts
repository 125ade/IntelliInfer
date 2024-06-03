import {Router} from "express";
import UserController from "../controllers/user.controller";
import { Request } from 'express';
import multer from 'multer';



// Configura multer per gestire l'upload dei file
const storage = multer.diskStorage({
    destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        // Definisco ora una destinazione temporanea /uploads, la destinazione vera la definisco nel repository
        cb(null, '../uploads/'); 
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, file.originalname);
    }
});
  
const upload = multer({
    storage: storage,
});

export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available models
        this.router.get("/model/list", this.userController.modelList.bind(this.userController));
        
            
        // visualize the model filtered by id
        this.router.get("/model/:modelId", this.userController.findModelById.bind(this.userController));
        

        // creates a dataset
        this.router.post("/dataset/create", this.userController.createDataset.bind(this.userController));
        

        // deletes a dataset (logically)
        this.router.delete("/dataset/:datasetId/delete", this.userController.deleteDatasetById.bind(this.userController));
        

        // finds an inference result given its id
        this.router.get("/inference/state/:resultId", this.userController.findResultById.bind(this.userController));

        // todo post /dataset/:datasetId/upload
        // autenticazione
        // autorizzazione "user"
        this.router.post("/dataset/:datasetId/upload", upload.single("image"), this.userController.uploadFile.bind(this.userController));
        
        /** 
        // todo get /inference/result/:resultId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/inference/result/:resultId", this.userController.TOIMPLEMENT);
        */

        /** 
        // todo get /dataset/list
        // autenticazione
        // autorizzazione "user"
        this.router.get("/dataset/list",
            this.userController.TOIMPLEMENT);

        // todo get /dataset/:datasetId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/dataset/:datasetId", this.userController.TOIMPLEMENT);
        */

        /** 
        // todo post /inference/:datasetId/:aiId/
        // autenticazione
        // autorizzazione "user"
        this.router.post("/inference/:datasetId/:aiId/", this.userController.TOIMPLEMENT);
        */
        

    }
}