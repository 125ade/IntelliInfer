import {Router} from "express";
import UserController from "../controllers/user.controller";

export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): void {

        this.router.post("/", this.userController.TOIMPLEMENT);

    }

}