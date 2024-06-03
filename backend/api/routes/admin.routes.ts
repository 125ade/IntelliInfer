import {Router} from "express";
import AdminController from "../controllers/admin.controller";
import { body, param } from 'express-validator';

const tokenControl = () => body('token').notEmpty();
const idControl = (id: string) => param(id).isInt();

export default class AdminRoutes{
    router:Router = Router();
    adminController:AdminController = new AdminController();
    
    constructor() {
        this.initRouters();
    }

    // admin routes
    
    initRouters(): void {

        // route to update neural network model weights
        this.router.put("/model/:aiId/change/weights", this.adminController.updateWeights.bind(this.adminController));

        // route to recharge user credit
        // this.router.put("/credit/recharge/:userId", this.adminController.rechargeTokens);

    }
    

}



