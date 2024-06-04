import {Router} from "express";
import UserController from "../controllers/user.controller";
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Dataset from "../models/dataset";
import unzipper from 'unzipper';



/*
// Setup Multer to save directly to Docker volume
const storage = multer.diskStorage({
    destination: '/app/media', // This is where the images will be saved in the Docker volume
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
*/

/** 
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const datasetId = req.params.datasetId;
        const dataset = await Dataset.findByPk(datasetId);
        const datasetPath = dataset?.path;
        if(typeof datasetPath === 'string'){
           const destination = path.join('/app/media', datasetPath, 'img');

           // Assicurati che la cartella di destinazione esista
           if (!fs.existsSync(destination)) {
              fs.mkdirSync(destination, { recursive: true });
           }
           cb(null, destination);
        }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});
*/

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const destination = path.join('/app/media', 'img');
        if (!fs.existsSync(destination)) {
              fs.mkdirSync(destination, { recursive: true });
        }
        cb(null, destination);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});


const upload = multer({ storage });

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


        // esegue l'upload di un'immagine
        this.router.post("/dataset/:datasetId/upload/image", upload.single("image"), this.userController.uploadImage.bind(this.userController));

        
        // esegue l'upload di un file zip
        this.router.post('/dataset/:datasetId/upload/zip', upload.single('zip'), this.userController.uploadZip.bind(this.userController));
    

        // esegue l'upload di un file( zip o immagine)
        this.router.post('/dataset/:datasetId/upload/file', upload.single('file'), this.userController.uploadFile.bind(this.userController));
        
        
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