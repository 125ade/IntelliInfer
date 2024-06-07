import {Router} from "express";
import UserController from "../controllers/user.controller";
import multer from 'multer';
import { validateCreateDataset, validateParamIntGreaterThanZero, validateFileUpload } from "../middleware/validation.middleware";
import {AuthUser} from "../middleware/auth.middleware";



// Multer configuration to manage uploaded files
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });


export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available ai models
        this.router.get(
            "/model/list",
            AuthUser,
            this.userController.modelList.bind(this.userController)
        );


        // visualize an ai model filtered by id
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
        // TODO: we have to change this route because we have to find the result given the id of the inference
        this.router.get(
            "/inference/result/:resultId",
            AuthUser,
            validateParamIntGreaterThanZero('resultId'),
            this.userController.findResultById.bind(this.userController)
        );


        // upload of an image
        this.router.post(
            "/dataset/:datasetId/upload/image",
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single("image"),
            this.userController.uploadImage.bind(this.userController));


        // upload of a zip file
        this.router.post(
            '/dataset/:datasetId/upload/zip',
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single('zip'),
            this.userController.uploadZip.bind(this.userController));


        // upload of a file (zip or image)
        // TODO: handle user tokens
        this.router.post(
            '/dataset/:datasetId/upload/file',
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single('file'),
            validateFileUpload,
            this.userController.uploadFile.bind(this.userController)
        );


        // autenticazione
        // autorizzazione "user"
        this.router.get(
            '/dataset/list',
            AuthUser,
            this.userController.datasetListByUserId.bind(this.userController));



        // autenticazione
        // autorizzazione "user"
        this.router.get(
            "/dataset/:datasetId",
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            this.userController.datasetDetail.bind(this.userController));



        // display of a user's remaining credit
        this.router.get('/display/credit',
            AuthUser,
            this.userController.displayResidualCredit.bind(this.userController)
        );

    }
}