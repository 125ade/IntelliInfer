import {Response, Request} from "express";
import { validationResult } from 'express-validator';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import { Repository } from '../repository/repository'

export default class AdminController {

    repository = new Repository();

    async updateWeights(req: Request, res: Response): Promise<undefined> {}

   
    async rechargeTokens(req: Request, res: Response): Promise<undefined> {

        // ConcreteErrorCreator().createBadRequestError().setMissingToken();
        
        const userId = Number(req.params.userId);
        const tokensToAdd = req.body.tokens; 
        const promiseResult = this.repository.updateUserToken(userId,tokensToAdd);
        promiseResult.then((result) => {return res.json(result)})
                        .catch((err) => {return err.send()});
    }

}