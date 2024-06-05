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
            new ConcreteErrorCreator().createServerError().setFailedGenToken().send(res)
        }
    }

    async startInference(req: Request, res: Response, next: NextFunction) {

    }

    async checkStatusInference(req: Request, res: Response, next: NextFunction) {

    }

    async getInfernceResoult(req: Request, res: Response, next: NextFunction) {

    }

}