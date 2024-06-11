import {Response, Request} from "express";
import { Repository } from '../repository/repository'
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import { ErrorCode } from "../factory/ErrorCode";
import User from "../models/user";
import fs from 'fs';
import path from 'path';
import {sendSuccessResponse} from "../utils/utils";
import process from "node:process";
import {StatusCode} from "../static";
import {isNumeric} from "validator";

const destination: string = process.env.DESTINATION_PATH_WEIGHTS || "/app/media/weights";
const file_extension: string = process.env.FILE_WEIGHTS_EXTENSION || ".pt";

export default class AdminController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }
    

    // update the weights' path of an AI model
    async updateWeights(req: Request, res: Response): Promise<void> {
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

                sendSuccessResponse(res, "Weights uploaded successfully",StatusCode.created);
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
    async rechargeTokens(req: Request, res: Response): Promise<void> {
        try {
            const { email, tokensToAdd } = req.body;

            if (isNumeric(tokensToAdd)){
                throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedElement();
            }

            const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(email);

            if( user instanceof ConcreteErrorCreator){
                throw user;
            }
            // Update user's credit by adding tokensToAdd
            user.token = Number(user.token) + Number(tokensToAdd);
            await user.save();

            sendSuccessResponse(res, "Credit recharged successfully", StatusCode.created, user);
        } catch (error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }

}