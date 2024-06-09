import {Response, Request} from "express";
import { Repository } from '../repository/repository'
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { ErrorCode } from "../factory/ErrorCode";
import User from "../models/user";
import fs from 'fs';
import path from 'path';
import {SuccessResponse} from "../utils/utils";
import process from "node:process";

const destination: string = process.env.DESTINATION_PATH_WEIGHTS || "/app/media/weights";
const file_extension: string = process.env.FILE_WEIGHTS_EXTENSION || ".pt";

export default class AdminController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }
    

    // update the weights' path of an ai model
    async updateWeights(req: Request, res: Response) {
        try{
            if (!req.file) {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentFile();
            }

            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }

            const fileExtension: string = path.extname(req.file.originalname).toLowerCase();
            if (fileExtension === file_extension) {
                const filePath: string = path.join(destination, `${req.file.originalname}`);
                fs.writeFileSync(filePath, req.file.buffer);

                await this.repository.updateModelWeights(Number(req.params.aiId), filePath);

                const dataResult: SuccessResponse = {
                    success: true,
                    message: 'Weights uploaded successfully',
                }
                res.status(200).json( dataResult);
            } else {
                throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
            }

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

            const user: User|ConcreteErrorCreator = await this.repository.getUserByEmail(email);

            if( user instanceof ConcreteErrorCreator){
                throw user;
            }else{
                // Update user's credit by adding tokensToAdd
                user.token = Number(user.token) + Number(tokensToAdd);
                await user.save();
                const dataResult: SuccessResponse = {
                    success: true,
                    message: 'Credit recharged successfully',
                    obj: user
                }
                return res.status(200).json(dataResult);
            }

        } catch (error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }

}