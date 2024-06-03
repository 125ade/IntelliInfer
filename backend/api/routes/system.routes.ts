import {Router} from "express";
import UserController from "../controllers/system.controller";

export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // visualize all available models
        this.router.get("/generate/token/:userId", this.userController.generateTokenFromUserId.bind(this.userController));


    }

}