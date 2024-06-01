import {Router} from "express";
import UserController from "../controllers/user.controller";

export default class UserRoutes{
    router:Router = Router();
    userController:UserController = new UserController();

    constructor() {
        this.initRouters();
    }

    initRouters(): undefined {

        // todo get /model/list
        // autenticazione
        // autorizzazione "user"
        this.router.get("/model/list",
            this.userController.TOIMPLEMENT);

        // todo get /model/:modelId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/model/:modelId",
            this.userController.TOIMPLEMENT);

        // todo get /dataset/list
        // autenticazione
        // autorizzazione "user"
        this.router.get("/dataset/list",
            this.userController.TOIMPLEMENT);

        // todo get /dataset/:datasetId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/dataset/:datasetId", this.userController.TOIMPLEMENT);

        // todo post /dataset/create
        // autenticazione
        // autorizzazione "user"
        this.router.post("/dataset/create", this.userController.TOIMPLEMENT);

        // todo put /dataset/:datasetId/update
        // autenticazione
        // autorizzazione "user"
        this.router.put("/dataset/:datasetId/update", this.userController.TOIMPLEMENT);

        // todo delete /dataset/:datasetId/delete
        // autenticazione
        // autorizzazione "user"
        this.router.delete("/dataset/:datasetId/delete", this.userController.TOIMPLEMENT);

        // todo post /dataset/:datasetId/upload
        // autenticazione
        // autorizzazione "user"
        this.router.post("/dataset/:datasetId/upload", this.userController.TOIMPLEMENT);

        // todo post /inference/:datasetId/:aiId/
        // autenticazione
        // autorizzazione "user"
        this.router.post("/inference/:datasetId/:aiId/", this.userController.TOIMPLEMENT);

        // todo get /inference/state/:resultId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/inference/state/:resultId", this.userController.TOIMPLEMENT);

        // todo get /inference/result/:resultId
        // autenticazione
        // autorizzazione "user"
        this.router.get("/inference/result/:resultId", this.userController.TOIMPLEMENT);


    }

}