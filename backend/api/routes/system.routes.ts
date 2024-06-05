import {Router} from "express";
import UserController from "../controllers/system.controller";
import {validateParamIntGreaterThanZero} from "../middleware/validation.middleware";


export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available models
        this.router.get(
            "/generate/token/:userId",
            validateParamIntGreaterThanZero("userId"),
            this.userController.generateTokenFromUserId.bind(this.userController));


    }

}