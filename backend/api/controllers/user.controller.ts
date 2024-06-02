import {Response, Request} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";

export default class UserController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async modelList(req: Request, res: Response) {
        try {
            const aiModels = await this.repository.listAiModels();
            res.status(200).json(aiModels);
        } catch (error) {
            if (error instanceof ErrorCode) {
                // Usare il metodo send dell'errore specifico per inviare la risposta
                error.send(res);
            } else {
                // In caso di errore generico non previsto
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }
}

    

