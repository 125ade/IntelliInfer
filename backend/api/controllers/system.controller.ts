import {Response, Request, NextFunction} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import {decodeToken, generateToken} from "../token";
import User from "../models/user";
import Dataset from "../models/dataset";
import Ai from "../models/ai";
import process from "node:process";
import {TaskQueue} from "../queues/Worker";
import {JobData} from "../queues/jobData";
import Image from "../models/image";
import Result from "../models/result";
import {SuccessResponse} from "../utils/utils";


export default class SystemController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async generateTokenFromUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId: number = Number(req.params.userId);
            if (isNaN(userId)) {
                new ConcreteErrorCreator().createBadRequestError().setNoUserId().send(res);
            }

            const user: User | ConcreteErrorCreator = await this.repository.getUserById(userId);
            if (user instanceof ConcreteErrorCreator ) {
                new ConcreteErrorCreator().createNotFoundError().setNoUser().send(res);
            }else{
                const token = generateToken(user);
                res.status(200).json({ token });
            }
        } catch (error) {
            if (error instanceof ErrorCode){
                error.send(res);
            }else{
                new ConcreteErrorCreator().createServerError().setFailedGenToken().send(res);
            }
        }
    }

    async startInference(req: Request, res: Response, next: NextFunction) {
        try {
            const costoInferenza: number = Number(process.env.INFERENCE_COST || '2.5');
            const datasetId: number = Number(req.params.datasetId);
            if (datasetId !== undefined) {
                const dataset: Dataset | ConcreteErrorCreator = await this.repository.getDatasetDetail(datasetId);
                if (dataset instanceof ConcreteErrorCreator) {
                    throw dataset;
                }
                const aiId: number = Number(req.params.aiId);
                if (aiId !== undefined) {
                    const ai: Ai | ConcreteErrorCreator = await this.repository.findModel(aiId);
                    if (ai instanceof ConcreteErrorCreator) {
                        throw ai;
                    }
                    const token:string | undefined = req.headers.authorization
                    if (token === undefined || token === "") {
                        throw new ConcreteErrorCreator().createAuthenticationError().setNoToken();
                    }
                    const decode = decodeToken(token.split(' ')[1]);
                    if (decode.email !== undefined) {
                        const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(decode.email);
                        if (user instanceof User) {
                            const amountInference: number = Number(dataset.countElements * costoInferenza);
                            if(await this.repository.checkUserToken(user.id, amountInference )){
                                const imageList: Image[] | ConcreteErrorCreator = await this.repository.listImageFromDataset(dataset.id)
                                if (imageList instanceof ConcreteErrorCreator) {
                                    throw imageList;
                                }
                                const newUuid: string = await this.repository.generateUUID();
                                const resultList: Result[] | ConcreteErrorCreator = await this.repository.createListResult(imageList,ai.id,newUuid);
                                if (resultList instanceof ConcreteErrorCreator){
                                    throw resultList;
                                }
                                const dataJob: JobData = {
                                    userEmail: user.email,
                                    callCost: amountInference,
                                    resultUUID: newUuid,
                                    model: {
                                        aiId: ai.id,
                                        architecture: ai.architecture,
                                        pathweights: ai.pathweights,
                                    },
                                    dataset: {
                                        datasetId: dataset.id,
                                        pathdir: dataset.path,
                                        tags: await this.repository.getTags(dataset.id),
                                    },
                                    images: imageList,
                                    results: resultList,
                                }
                                const successResult: SuccessResponse={
                                        success: true,
                                        message: "start inference on your dataset",
                                        obj: {
                                             resultId: newUuid,
                                             datasetId: dataset.name,
                                             architecture: ai.architecture,
                                        }
                                }
                                await TaskQueue.getInstance().getQueue().addJob(dataJob)
                                res.status(200).json(successResult);
                            }else{
                                throw new ConcreteErrorCreator().createForbiddenError().setInsufficientToken();
                            }
                        }else{
                            throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
                        }

                    }else{
                        throw new ConcreteErrorCreator().createServerError().setFailedStartInference();
                    }
                }else{
                    throw new ConcreteErrorCreator().createBadRequestError().setNoModelId();
                }
            }else{
                throw new ConcreteErrorCreator().createBadRequestError().setNoDatasetId();
            }
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