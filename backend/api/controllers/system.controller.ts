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
import {FinishData, FinishResult, JobData} from "../queues/jobData";
import Image from "../models/image";
import Result from "../models/result";
import {SuccessResponse} from "../utils/utils";
import {isNumeric} from "validator";
import {JobState} from "bullmq";
import { Canvas, createCanvas, loadImage } from 'canvas';
import { DataResultInterface } from "../queues/jobData";
import { BoundingBox } from "../queues/jobData";
import { Image as LoadedImage } from "canvas";



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



            try {
                const j = await TaskQueue.getInstance().getQueue().addJob(dataJob.resultUUID, dataJob);
                const successResult: SuccessResponse = {
                    success: true,
                    message: "start inference on your dataset",
                    obj: {
                        jobId: j.id,
                        // resultId: newUuid,
                        datasetName: dataset.name,
                        architecture: ai.architecture,
                    }
                };
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

    async getStatusJob(req: Request, res: Response){
        const jobId = req.params.jobId;
        try {
            const taskQueue = TaskQueue.getInstance();
            const job = await taskQueue.getQueue().getJob(jobId);
            if (!job) {
                throw new ConcreteErrorCreator().createServerError().setFailedCheckStatus().send(res);
            }
            const status = await job.getState();
            let resultJson : SuccessResponse;
            switch (status){
                case "active": // RUNNING
                    resultJson = {
                        success: true,
                        message: "RUNNING",
                        obj: {
                            jobId: job.id,
                        }
                    }
                    break;
                case "waiting": // PENDING
                case "delayed":
                    resultJson = {
                        success: true,
                        message: "PENDING",
                        obj: {
                            jobId: job.id,
                        }
                    }
                    break;
                case "completed": // COMPLETED
                    resultJson = {
                        success: true,
                        message: "COMPLETED",
                        obj: {
                            jobId: job.id,
                            results: await this.repository.findResult(job.name)
                        }
                    }
                    break;
                case "failed": // FAILED
                    const { failedReason } = job;
                    if (failedReason === 'insufficient token' && job.stacktrace.includes('ABORTED')) {
                        resultJson = {
                            success: true,
                            message: "ABORTED",
                            obj: {
                                jobId: job.id,
                            }
                        }
                        break;
                    }
                case "unknown":
                default:
                    resultJson = {
                        success: true,
                        message: "FAILED",
                        obj: {
                            jobId: job.id,
                        }
                    }
            }
            res.status(200).json(resultJson);
        } catch (err) {
            if (!(err instanceof ConcreteErrorCreator)) {
                new ConcreteErrorCreator().createServerError().setFailedCheckStatus().send(res);
            }
        }
    }


    async getInferenceResult(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId: string = req.params.jobId;
            const imageId = Number(req.params.imageId);
            const job = await TaskQueue.getInstance().getQueue().getJob(jobId);
            if (!job) {
                throw new ConcreteErrorCreator().createServerError().setFailedRetriveItem().send(res);
            }
            const inferenceResult: ConcreteErrorCreator | Result[] = await this.repository.findResultByUuidAndImageId(job.name, Number(imageId));
            
            // Verifica che `inferenceResult` sia un array valido prima di procedere
            if (!Array.isArray(inferenceResult) || inferenceResult.length === 0) {
                return res.status(404).json({ error: "No results found for the given parameters" });
            }

            // Ottieni il percorso dell'immagine
            const imagePath: string | ConcreteErrorCreator = await this.repository.getImagePathFromId(inferenceResult[0].imageId);
            if (typeof imagePath !== 'string') {
                return res.status(500).json({ error: "Failed to retrieve image path" });
            }

            // Carica l'immagine originale
            const imageURL: string = `${imagePath}`;
            const imgElement: LoadedImage = await loadImage(imageURL);

            // Crea un canvas e ottieni il contesto
            const canvas: Canvas = createCanvas(imgElement.width * 2, imgElement.height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return res.status(500).json({ error: "Failed to get 2D context" });
            }

            // Disegna l'immagine originale sul lato sinistro
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            // Disegna di nuovo l'immagine sul lato destro per annotazioni
            ctx.drawImage(imgElement, imgElement.width, 0, imgElement.width, imgElement.height);

            // Disegna i bounding box sul lato destro
            inferenceResult.forEach((result: Result) => {
                const data: FinishData = result.data;
                const box: BoundingBox[] | undefined = data.box;
                if (box) {
                    box.forEach((bb: BoundingBox) => {
                        const { x_center, y_center, width, height, class_id, confidence } = bb;
                        console.log(x_center);
                        console.log(y_center);
                        console.log(width);
                        console.log(height);
                        console.log(confidence);

                        const x: number = (x_center - width / 2) * imgElement.width;
                        const y: number = (y_center - height / 2) * imgElement.height;
                        const w: number = width * imgElement.width;
                        const h: number = height * imgElement.height;

                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(x + imgElement.width, y, w, h);

                        ctx.fillStyle = 'red';
                        ctx.font = '20px Arial';
                        ctx.fillText(`Class: ${class_id}, Conf: ${(confidence * 100).toFixed(2)}%`, x + imgElement.width, y - 5);
                    });
                }
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
                new ConcreteErrorCreator().createServerError().setFailedRetriveItem().send(res);
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