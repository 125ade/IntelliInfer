import {Router} from "express";
import SystemController from "../controllers/system.controller";
import {validateParamIntGreaterThanZero} from "../middleware/validation.middleware";


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


    }

}