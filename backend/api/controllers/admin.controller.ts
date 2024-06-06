import {Response, Request} from "express";
import { Repository } from '../repository/repository'
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { ErrorCode } from "../factory/ErrorCode";
import User from "../models/user";

export default class AdminController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async updateWeights(req: Request, res: Response) {
        try{
            const aiId: number = Number(req.params.aiId);
            const weights: string = String(req.body.weights);

            const model = await this.repository.updateModelWeights(aiId, weights);
            res.status(200).json(model);
        } catch (error){
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }
    
    // recharges user credit 
    async rechargeTokens(req: Request, res: Response) {
        try {
            const { email, tokensToAdd } = req.body;

            const user = await this.repository.getUserByEmail(email);

            if( user instanceof User){
                // Update user's credit by adding tokensToAdd
                user.token += tokensToAdd;
                await user.save();
            }
            return res.status(200).json({ message: 'Credit recharged successfully', user });
        } catch (error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }

}