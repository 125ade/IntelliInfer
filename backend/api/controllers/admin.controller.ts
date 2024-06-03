import {Response, Request} from "express";
import { Repository } from '../repository/repository'
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { ErrorCode } from "../factory/ErrorCode";

export default class AdminController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async updateWeights(req: Request, res: Response): Promise<undefined> {
        try{
            const { aiId } = req.params;
            const { weights } = req.body;

            if (weights) {
                const model = this.repository.updateModelWeights( aiId, weights);
                res.status(200).json(model);
            } else {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentBody();
            }
        } catch (error){
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

   /** 
    async rechargeTokens(req: Request, res: Response): Promise<undefined> {

        // ConcreteErrorCreator().createBadRequestError().setMissingToken();
        
        const userId = Number(req.params.userId);
        const tokensToAdd = req.body.tokens; 
        const promiseResult = this.repository.updateUserToken(userId,tokensToAdd);
        promiseResult.then((result) => {return res.json(result)})
                        .catch((err) => {return err.send()});
    }
    */

}