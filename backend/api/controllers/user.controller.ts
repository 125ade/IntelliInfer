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
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async findModelById(req: Request, res: Response) {
        try {
            const modelId: number = Number(req.params.modelId);
            const aiModel = await this.repository.findModel(modelId);
            res.status(200).json(aiModel);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // In caso di errore generico non previsto
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async findResultById(req: Request, res: Response) {
        try {
            const resultId: number = Number(req.params.resultId);
            const inferenceResult = await this.repository.findResult(resultId);
            res.status(200).json(inferenceResult);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // In caso di errore generico non previsto
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async createDataset(req: Request, res: Response) {
        try{
            const result = await this.repository.createDatasetWithTags(req.body);
            return res.status(201).json(result);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // In caso di errore generico non previsto
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }
}


    

