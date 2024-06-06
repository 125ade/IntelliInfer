import {Router, Request, Response, RequestHandler } from "express";
import UserController from "../controllers/user.controller";
import multer from 'multer';
import { validateCreateDataset, validateParamIntGreaterThanZero, validateFileUpload } from "../middleware/validation.middleware";
import {AuthUser, verifyTokenExpiration, verifyTokenSignature, verifyUserRole} from "../middleware/auth.middleware";
import {UserRole} from "../static";


// Configura multer per gestire i file caricati
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available models
        this.router.get(
            "/model/list",
            AuthUser,
            this.userController.modelList.bind(this.userController)
        );


        // visualize the model filtered by id
        this.router.get(
            "/model/:modelId",
            AuthUser,
            validateParamIntGreaterThanZero('modelId'),
            this.userController.findModelById.bind(this.userController)
        );
        


        // creates a dataset
        this.router.post(
            "/dataset/create",
            AuthUser,
            validateCreateDataset,
            this.userController.createDataset.bind(this.userController)
        );


        // deletes a dataset (logically)
        this.router.delete(
            "/dataset/delete/:datasetId",
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            this.userController.deleteDatasetById.bind(this.userController)
        );


        // finds an inference result given its id
        // todo: we have to change this route because we have to find the result given the id of the inference
        this.router.get(
            "/inference/result/:resultId",
            AuthUser,
            validateParamIntGreaterThanZero('resultId'),
            this.userController.findResultById.bind(this.userController)
        );


        // esegue l'upload di un'immagine
        this.router.post(
            "/dataset/:datasetId/upload/image",
            //AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single("image"),
            this.userController.uploadImage.bind(this.userController));


        // esegue l'upload di un file zip
        this.router.post(
            '/dataset/:datasetId/upload/zip',
            //AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single('zip'),
            this.userController.uploadZip.bind(this.userController));


        // esegue l'upload di un file( zip o immagine)
        this.router.post(
            '/dataset/:datasetId/upload/file',
            //validateParamIntGreaterThanZero('datasetId'),
            upload.single('file'),
            //validateFileUpload,
            this.userController.uploadFile.bind(this.userController)
        );


        /**
        // todo get /inference/state/:resultId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/inference/result/:resultId", this.userController.TOIMPLEMENT);
        */


        // todo get /dataset/list
        // autenticazione
        // autorizzazione "user"
        this.router.get(
            '/dataset/list',
            AuthUser,
            this.userController.datasetListByUserId.bind(this.userController));

        /**
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