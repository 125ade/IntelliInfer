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
import {isNumeric} from "validator";
import {JobState} from "bullmq";


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
            if (user instanceof ConcreteErrorCreator) {
                new ConcreteErrorCreator().createNotFoundError().setNoUser().send(res);
            }else{
                const token: string = generateToken(user);
                res.status(200).json({ token });
            }
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedGenToken().send(res);
            }
        }
    }

    async startInference(req: Request, res: Response, next: NextFunction) {
        try {
            const costoInferenza: number = Number(process.env.INFERENCE_COST || '2.5');
            const datasetId: number = Number(req.params.datasetId);

            if (!datasetId) {
                throw new ConcreteErrorCreator().createBadRequestError().setNoDatasetId();
            }

            const dataset: Dataset | ConcreteErrorCreator = await this.repository.getDatasetDetail(datasetId);

            if (dataset instanceof ConcreteErrorCreator) {
                throw dataset;
            }

            const aiId: number = Number(req.params.aiId);

            if (!aiId) {
                throw new ConcreteErrorCreator().createBadRequestError().setNoModelId();
            }

            const ai: Ai | ConcreteErrorCreator = await this.repository.findModel(aiId);

            if (ai instanceof ConcreteErrorCreator) {
                throw ai;
            }

            const token: string | undefined = req.headers.authorization;

            if (!token) {
                throw new ConcreteErrorCreator().createAuthenticationError().setNoToken();
            }

            const decode: any = decodeToken(token.split(' ')[1]);

            if (!decode.email) {
                throw new ConcreteErrorCreator().createServerError().setFailedStartInference();
            }

            const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(decode.email);

            if (!(user instanceof User)) {
                throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
            }

            const amountInference: number = dataset.countElements * costoInferenza;

            if (!await this.repository.checkUserToken(user.id, amountInference)) {
                throw new ConcreteErrorCreator().createForbiddenError().setInsufficientToken();
            }

            const imageList: Image[] | ConcreteErrorCreator = await this.repository.listImageFromDataset(dataset.id);

            if (imageList instanceof ConcreteErrorCreator) {
                throw imageList;
            }

            const newUuid: string = await this.repository.generateUUID();

            const resultList: Result[] | ConcreteErrorCreator = await this.repository.createListResult(imageList, ai.id, newUuid);

            if (resultList instanceof ConcreteErrorCreator) {
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
            };

            const successResult: SuccessResponse = {
                success: true,
                message: "start inference on your dataset",
                obj: {
                    resultId: newUuid,
                    datasetName: dataset.name,
                    architecture: ai.architecture,
                }
            };

            try {
                await TaskQueue.getInstance().getQueue().addJob(dataJob.resultUUID, dataJob);
                res.status(200).json(successResult);
            } catch (err) {
                throw new ConcreteErrorCreator().createServerError().setFailedStartInference();
            }

        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedStartInference().send(res);
            }
        }
    }


    async checkStatusInference(req: Request, res: Response) {
        console.log(res);
        // try {
        //     console.log(res);
        //     const jobId: string = req.params.uuid;
        //     console.log(jobId)
        //
        //     if (!jobId) {
        //         throw new ConcreteErrorCreator().createBadRequestError().setNoJobId();
        //     }
        //
        //     const job: JobState | "unknown" = await TaskQueue.getInstance().getQueue().getJobStatus(jobId);
        //     console.log(job)
        //     if (job === "unknown") {
        //         throw new ConcreteErrorCreator().createNotFoundError().setJobNotFound();
        //     }
        //     // const jobStatus = await job.getState();
        //     // console.log(jobStatus);
        //     // // todo riportare anche i risultati se completo
        //     // let response: SuccessResponse = {
        //     //     success: true,
        //     // };
        //     //
        //     // switch (jobStatus) {
        //     //     case 'completed':
        //     //         //console.log("terminato");
        //     //         response.message = "Job completed";
        //     //         //response.result = jobResult; // Include the result of the inference
        //     //         break;
        //     //     case 'failed':
        //     //         response.message = "Job failed";
        //     //         //response.error = job.failedReason;
        //     //         break;
        //     //     case 'active':
        //     //         response.message = "Job running";
        //     //         break;
        //     //     case 'waiting':
        //     //         response.message = "Job pending";
        //     //         break;
        //     //     case 'delayed':
        //     //         response.message = "Job delayed";
        //     //         break;
        //     //     // case 'stuck':
        //     //     //     response.message = "Job stuck";
        //     //     //     break;
        //     //     // case 'aborted':
        //     //     //     response.message = "Job aborted due to insufficient credit";
        //     //     //     break;
        //     //     default:
        //     //         response.message = "Unknown job status";
        //     // }
        //
        //     res.status(200).json({job});
        //
        // } catch (error) {
        //     if (error instanceof ErrorCode) {
        //         error.send(res);
        //     } else {
        //         new ConcreteErrorCreator().createServerError().setFailedCheckStatus().send(res);
        //     }
        // }
    }

    async getInferenceResult(req: Request, res: Response, next: NextFunction) {
        try {
            const uuid: string = req.params.uuid;
            const imageId: number | string = req.params.imageId;
            let inferenceResult: ConcreteErrorCreator | Result[] = [];
            if (isNumeric(imageId)) {
                inferenceResult = await this.repository.findResultByUuidAndImageId(uuid, Number(imageId));
            }
            if (imageId === "all"){
                inferenceResult = await this.repository.findResult(uuid);
            }

            // todo check del istanza e creazione del risultato
            res.status(200).json({todo:"todo"});
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedRetriveItem().send(res);
            }
        }
    }
    //     try {
    //         const resultUUID: string = req.params.resultUUID;
    //
    //         if (!resultUUID) {
    //             throw new ConcreteErrorCreator().createBadRequestError().setNoResultUUID();
    //         }
    //
    //         const resultData: ResultData | ConcreteErrorCreator = await this.repository.getResultData(resultUUID);
    //
    //         if (resultData instanceof ConcreteErrorCreator) {
    //             throw resultData;
    //         }
    //
    //         res.status(200).json({
    //             success: true,
    //             message: "Inference result retrieved successfully",
    //             data: resultData
    //         });
    //
    //     } catch (error) {
    //         if (error instanceof ErrorCode) {
    //             error.send(res);
    //         } else {
    //             new ConcreteErrorCreator().createServerError().setFailedRetrieveResult().send(res);
    //         }
    //     }
    // }



}