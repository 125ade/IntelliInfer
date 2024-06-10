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
import { createCanvas, loadImage } from 'canvas';


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


    async checkStatusInference(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId: string = req.params.jobId;

            if (!jobId) {
                throw new ConcreteErrorCreator().createBadRequestError().setNoJobId();
            }

            const job = await TaskQueue.getInstance().getQueue().getJob(jobId);

            if (job === undefined) {
                throw new ConcreteErrorCreator().createNotFoundError().setJobNotFound();
            }
            const jobStatus = await job.getState();
            console.log(jobStatus);
            // todo riportare anche i risultati se completo
            let response: SuccessResponse = {
                success: true,
            };

            switch (jobStatus) {
                case 'completed':
                    //console.log("terminato");
                    response.message = "Job completed";
                    //response.result = jobResult; // Include the result of the inference
                    break;
                case 'failed':
                    response.message = "Job failed";
                    //response.error = job.failedReason;
                    break;
                case 'active':
                    response.message = "Job running";
                    break;
                case 'waiting':
                    response.message = "Job pending";
                    break;
                case 'delayed':
                    response.message = "Job delayed";
                    break;
                // case 'stuck':
                //     response.message = "Job stuck";
                //     break;
                // case 'aborted':
                //     response.message = "Job aborted due to insufficient credit";
                //     break;
                default:
                    response.message = "Unknown job status";
            }

            res.status(200).json(response);

        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedCheckStatus().send(res);
            }
        }
    }

    async getInferenceResult(req: Request, res: Response, next: NextFunction) {
        try {
            const uuid: string = req.params.uuid;
            const imageId: number | string = req.params.imageId;
    
            let inferenceResult: ConcreteErrorCreator | Result[] = [];
            if (this.isNumeric(imageId)) {
                inferenceResult = await this.repository.findResultByUuidAndImageId(uuid, Number(imageId));
            } else if (imageId === "all") {
                inferenceResult = await this.repository.findResult(uuid);
            } else {
                return res.status(400).json({ error: "Invalid imageId parameter" });
            }
    
            // Verifica che `inferenceResult` sia un array valido prima di procedere
            if (!Array.isArray(inferenceResult) || inferenceResult.length === 0) {
                return res.status(404).json({ error: "No results found for the given parameters" });
            }
    
            // Ottieni il percorso dell'immagine
            const imagePath = await this.repository.getImagePathFromId(inferenceResult[0].imageId);
            if (typeof imagePath !== 'string') {
                return res.status(500).json({ error: "Failed to retrieve image path" });
            }
    
            // Carica l'immagine originale
            const imageURL = `/path/to/volume/${imagePath}`;
            const imgElement = await loadImage(imageURL);
    
            // Crea un canvas e ottieni il contesto
            const canvas = createCanvas(imgElement.width * 2, imgElement.height);
            const ctx = canvas.getContext('2d');
    
            if (!ctx) {
                return res.status(500).json({ error: "Failed to get 2D context" });
            }
    
            // Disegna l'immagine originale sul lato sinistro
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
    
            // Disegna di nuovo l'immagine sul lato destro per annotazioni
            ctx.drawImage(imgElement, imgElement.width, 0, imgElement.width, imgElement.height);
    
            // Disegna i bounding box sul lato destro
            inferenceResult.forEach(result => {
                const { x_center, y_center, width, height, class_id, confidence } = result.data.box;
    
                const x = (x_center - width / 2) * imgElement.width;
                const y = (y_center - height / 2) * imgElement.height;
                const w = width * imgElement.width;
                const h = height * imgElement.height;
    
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + imgElement.width, y, w, h);
    
                ctx.fillStyle = 'red';
                ctx.font = '20px Arial';
                ctx.fillText(`Class: ${class_id}, Conf: ${(confidence * 100).toFixed(2)}%`, x + imgElement.width, y - 5);
            });
    
            // Converti il canvas in un buffer
            const buffer = canvas.toBuffer('image/png');
    
            // Imposta gli header e invia il buffer come risposta
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedRetrieveItem().send(res);
            }
        }
    }
    
    // Helper function per verificare se un valore è numerico
    isNumeric(value: any): boolean {
        return !isNaN(value - parseFloat(value));
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