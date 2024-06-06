import {Response, Request, NextFunction} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import {generateToken} from "../token";
import User from "../models/user";

export default class SystemController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async generateTokenFromUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId: number = Number(req.params.userId);
            if (isNaN(userId)) {
                new ConcreteErrorCreator().createBadRequestError().setNoUserId().send(res)
            }

            const user: User | null = await this.repository.getUserById(userId);
            if (user !== null) {

                const token = generateToken(user);
                res.status(200).json({ token });


            }else{
                new ConcreteErrorCreator().createNotFoundError().setNoUser().send(res)
            }


        } catch (error) {
            //console.log(error)
            new ConcreteErrorCreator().createServerError().setFailedGenToken().send(res)
        }
    }

    async startInference(req: Request, res: Response, next: NextFunction) {
        try {
            // quantificare le immagini del dataset => attraverso datasetId
            // calcolo dei token necessari => attraverso jwt
            // verifica credito dei token sia sufficiente
            // raccolta dati
            // generare il codice result preliminare e prendere l'id
            // invio del job a redis {dataset id_postgres}




        }catch (error){
            if (error instanceof ErrorCode) {
                error.send(res);
            }else{
                new ConcreteErrorCreator().createServerError().setFailedStartInference().send(res);
            }
        }

    }

    async checkStatusInference(req: Request, res: Response, next: NextFunction) {

    }

    async getInfernceResoult(req: Request, res: Response, next: NextFunction) {

    }

}