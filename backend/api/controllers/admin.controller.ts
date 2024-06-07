import {Response, Request} from "express";
import { Repository } from '../repository/repository'
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { ErrorCode } from "../factory/ErrorCode";
import User from "../models/user";
import fs from 'fs';
import path from 'path';

export default class AdminController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async updateWeights(req: Request, res: Response) {
        try{
            if (!req.file) {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentFile();
            }
            
            const destination = '/app/media/weights';
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            if (fileExtension === '.pt') { // extension based control
                const filePath = path.join(destination, `${req.file.originalname}`);
                fs.writeFileSync(filePath, req.file.buffer);

                this.repository.updateModelWeights(Number(req.params.aiId), filePath);

            } else {
                throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
            }
            res.status(200).json( { Result: 'Weights uploaded successfully'});
        } catch(error){
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
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