import {Router} from "express";
import UserController from "../controllers/user.controller";
import multer from 'multer';
import { validateCreateDataset, validateParamIntGreaterThanZero, validateFileUpload, validateName } from "../middleware/validation.middleware";
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


        // upload of a file (zip or image)
        this.router.post(
            '/dataset/:datasetId/upload/file',
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            upload.single('file'),
            validateFileUpload,
            this.userController.uploadFile.bind(this.userController)
        );


        // visualize the list of datasets available for a user
        this.router.get(
            '/dataset/list',
            AuthUser,
            this.userController.datasetListByUserId.bind(this.userController));


        // finds a dataset given its id
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
        
        // update a dataset's name
        this.router.put('/dataset/update/:datasetId',
            AuthUser,
            validateParamIntGreaterThanZero('datasetId'),
            validateName,
            this.userController.updateDatasetName.bind(this.userController)
        );

    }
}