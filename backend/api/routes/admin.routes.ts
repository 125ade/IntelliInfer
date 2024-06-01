import {Router} from "express";
import AdminController from "../controllers/admin.controller";

export default class AdminRoutes{
    router:Router = Router();
    adminController:AdminController = new AdminController();

    constructor() {
        this.initRouters();
    }

    initRouters(): void {

        this.router.post("/", this.adminController.TOIMPLEMENT);

    }

}