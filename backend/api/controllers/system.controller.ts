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
                throw new ConcreteErrorCreator().createAuthenticationError().setInsufficientToken();
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

            let inferenceResult: ConcreteErrorCreator | Result;

            if (imageId === 0) {
                const results: ConcreteErrorCreator | Result[] = await this.repository.findResult(job.name);
                if (results instanceof ConcreteErrorCreator) {
                    throw results;
                }
                inferenceResult = results[0];
            } else {
                inferenceResult = await this.repository.findResultByUuidAndImageId(job.name, imageId);
                if (inferenceResult instanceof ConcreteErrorCreator) {
                    throw inferenceResult;
                }
            }

            const imagePath: string | ConcreteErrorCreator = await this.repository.getImagePathFromId(inferenceResult.imageId);
            if (typeof imagePath !== 'string') {
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
            }

            // Load the original image
            const imgElement: LoadedImage = await loadImage(imagePath);

            // Create a canvas and get the 2D context
            const canvas: Canvas = createCanvas(imgElement.width * 2, imgElement.height);
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
            }

            // Draw the original image on the left side
            ctx.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);

            // Draw the original image again on the right side for annotations
            ctx.drawImage(imgElement, imgElement.width, 0, imgElement.width, imgElement.height);

            const data: FinishData = inferenceResult.data;
            const box: BoundingBox[] | undefined = data.box;

            if (box === undefined) {
                throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
            }
            console.log(`larghezza: ${imgElement.width} altezza: ${imgElement.height}  toto larghezza: ${Number(imgElement.width*2)}`)
            for (const bb of box) {
                let { x_center, y_center, width, height, class_id, confidence } = bb;

                // const canvasWidth = imgElement.width * 2;
                // const canvasHeight = imgElement.height;
                //
                // // Centrare il bounding box nell'immagine di destra
                //  x_center = (canvasWidth / 4) * 3; // posizione centrale dell'immagine di destra
                //  y_center = canvasHeight / 2;

                let x: number = x_center
                let y: number = y_center
                let w: number = width;
                let h: number = height;

                // Log the bounding box details for debugging
                console.log(`Bounding Box - x: ${x}, y: ${y}, w: ${w}, h: ${h}, class: ${class_id}, confidence: ${confidence}`);

                // Draw the bounding box on the right side image
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + imgElement.width, y, w, h);

                // Add label with class and confidence
                ctx.fillStyle = 'red';
                ctx.font = '20px Arial';
                ctx.fillText(`Class: ${class_id}, Conf: ${(confidence * 100).toFixed(2)}%`, x + imgElement.width, y - 5);
            }

            // Convert the canvas to a buffer
            const buffer = canvas.toBuffer('image/png');

            // Set headers and send the buffer as response
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


}