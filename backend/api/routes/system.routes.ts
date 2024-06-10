import {Router} from "express";
import SystemController from "../controllers/system.controller";
import {
    validateParamIntGreaterThanZero,
    validateParamIntOrAll,
    validateParamUUID
} from "../middleware/validation.middleware";
import {AuthUser} from "../middleware/auth.middleware";


export default class SystemRoutes{
    router:Router = Router();
    systemController:SystemController = new SystemController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available models
        this.router.get(
            "/generate/token/:userId",
            validateParamIntGreaterThanZero("userId"),
            this.systemController.generateTokenFromUserId.bind(this.systemController)
        );

        // start the inference
        this.router.get(
        "/inference/:datasetId/:aiId/",
            AuthUser,
            validateParamIntGreaterThanZero("datasetId"),
            validateParamIntGreaterThanZero("aiId"),
        this.systemController.startInference.bind(this.systemController));

        // return the status of the inference or result json if completed
        this.router.get(
            "/inference/get/status/:jobId",
            AuthUser,
            validateParamIntGreaterThanZero("jobId"),
            this.systemController.getStatusJob.bind(this.systemController)
        );


        // finds an inference result given its id
        this.router.get(
            "/inference/result/:uuid/:imageId",
            AuthUser,
            validateParamUUID("uuid"),
            validateParamIntOrAll("imageId"),
            this.systemController.getInferenceResult.bind(this.systemController)
        );



    }

}