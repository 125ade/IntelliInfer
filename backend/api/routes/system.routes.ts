import {Router} from "express";
import SystemController from "../controllers/system.controller";
import {validateParamIntGreaterThanZero} from "../middleware/validation.middleware";
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
            this.systemController.generateTokenFromUserId.bind(this.systemController));


        // todo post /inference/:datasetId/:aiId/
        // autenticazione
        // autorizzazione "user"
        this.router.post(
        "/inference/:datasetId/:aiId/",
            AuthUser,
            validateParamIntGreaterThanZero("datasetId"),
            validateParamIntGreaterThanZero("aiId"),
        this.systemController.startInference.bind(this.systemController));



    }

}