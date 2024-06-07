import {Router} from "express";
import AdminController from "../controllers/admin.controller";
import { AuthAdmin } from "../middleware/auth.middleware";
import { validateParamIntGreaterThanZero, validateRechargeRequest } from "../middleware/validation.middleware";
import { upload } from "./user.routes";

export default class AdminRoutes{
    router:Router = Router();
    adminController:AdminController = new AdminController();
    
    constructor() {
        this.initRouters();
    }

    // admin routes
    
    initRouters(): void {

        // route to update neural network model weights
        this.router.put(
            "/model/:aiId/change/weights",
            AuthAdmin,
            validateParamIntGreaterThanZero('aiId'),
            upload.single("image"), 
            this.adminController.updateWeights.bind(this.adminController)
        );

        // route to recharge user credit
        this.router.put(
            "/credit/recharge",
            AuthAdmin,
            validateRechargeRequest, 
            this.adminController.rechargeTokens.bind(this.adminController)
        );

    }
}



