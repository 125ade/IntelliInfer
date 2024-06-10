import {Response, Request} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import fs from 'fs';
import path from 'path';
import AdmZip, { IZipEntry }  from 'adm-zip';
import User from "../models/user";
import {decodeToken} from "../token";
import mime from 'mime-types';
import {SuccessResponse} from "../utils/utils";
import Dataset from "../models/dataset";
import Ai from "../models/ai";
import Result from "../models/result";



export default class UserController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async modelList(req: Request, res: Response) {
        try {
            const aiModels: Ai[] | ConcreteErrorCreator = await this.repository.listAiModels();
            const resultJson: SuccessResponse = {
                success: true,
                message: "Model list",
                obj: aiModels
            }
            res.status(200).json(resultJson);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async datasetListByUserId(req: Request, res: Response): Promise<void> {
        try {
            const token: string | undefined = req.headers.authorization
            if (token !== undefined){
                const decode: any = decodeToken(token.split(' ')[1]);
                if (decode.email) {
                    const user: ConcreteErrorCreator | User = await this.repository.getUserByEmail(decode.email);
                    if (user && user instanceof User) {
                        const datasetList:  ConcreteErrorCreator | Dataset[] = await this.repository.getDatasetListByUserId(user.id);
                        const resultJson: SuccessResponse = {
                            success: true,
                            message: "Dataset list",
                            obj: datasetList
                        }
                        res.status(200).json(resultJson);
                    } else {
                        throw new ConcreteErrorCreator().createNotFoundError().setNoUser()
                    }
                } else {
                    throw new ConcreteErrorCreator().createBadRequestError().setMissingToken()
                }
            }else{
                throw new ConcreteErrorCreator().createAuthenticationError().setNoToken()
            }

        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            }
            new ConcreteErrorCreator().createServerError().setFailedDeleteItem().send(res)
        }
    }



    async datasetDetail(req: Request, res: Response): Promise<void> {
        try{
            if (req.params.datasetId !== undefined){
                const datasetId:  number = Number(req.params.datasetId);
                const dataset: ConcreteErrorCreator | Dataset = await this.repository.getDatasetDetail(datasetId);
                if (dataset !== null && dataset !== undefined && !(dataset instanceof ErrorCode)){
                    const resultJson: SuccessResponse = {
                            success: true,
                            message: "Dataset detail",
                            obj: dataset
                        }
                    res.status(200).json(resultJson);
                }else{
                    throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
                }
            }else{
                throw new ConcreteErrorCreator().createBadRequestError().setNoDatasetId();
            }

        }catch(error){
            if (error instanceof ErrorCode) {
                error.send(res);
            }else{
                new ConcreteErrorCreator().createServerError().setFailedRetriveItem().send(res)
            }
        }

    }


    async findModelById(req: Request, res: Response) {
        try {
            const modelId: number = Number(req.params.modelId);// todo ai model potrebbe ritornare null è da verificare
            const aiModel: ConcreteErrorCreator | Ai = await this.repository.findModel(modelId);
            const resultJson: SuccessResponse = {
                success: true,
                message: "Model detail",
                obj: aiModel
            }
            res.status(200).json(resultJson);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // console.log(error);
                throw new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }


    async createDataset(req: Request, res: Response) {
        try{
            const token: string | undefined = req.headers.authorization
            if (token !== undefined){
                const decode: any = decodeToken(token.split(' ')[1]);
                if (decode.email) {
                    const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(decode.email);
                    if (user && user instanceof User) {
                        const dataset: Dataset | ConcreteErrorCreator = await this.repository.createDatasetWithTags(req.body, user);
                        if(dataset instanceof ConcreteErrorCreator){
                            throw dataset;
                        }
                        const resultJson: SuccessResponse = {
                            success: true,
                            message: "Dataset created successfully",
                            obj: dataset
                        }
                        return res.status(201).json(resultJson);
                    }else{
                        throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
                    }
                }else{
                    throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
                }
            }else{
                throw new ConcreteErrorCreator().createAuthenticationError().setNoToken();
            }

        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                throw new ConcreteErrorCreator().createServerError().setFailedCreationItem().send(res);
            }
        }
    }

    async deleteDatasetById(req: Request, res: Response) {
        try{
            const result: Dataset | ConcreteErrorCreator = await this.repository.logicallyDelete(Number(req.params.datasetId));
            if(result instanceof ConcreteErrorCreator){
                throw result;
            }else{
                const resultJson : SuccessResponse = {
                    success: true,
                    message: 'Dataset deleted successfully.',
                    obj: result
                }
                return res.status(201).json(resultJson);
            }
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                throw new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }


    // route to upload an image or a file zip on volume and on database
    async uploadFile(req: Request, res: Response){
        try{
            if (!req.file) {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentFile();
            }

            // Calcola il costo totale dei file da caricare
            let totalNumber: number = 0;
            let totalCost: number = 0;
            if (req.file.mimetype.startsWith('image/')) {
                totalNumber = 1;
                totalCost = 0.75;
            } else if (req.file.mimetype.startsWith('application/zip')) {
                const zip: AdmZip = new AdmZip(req.file.buffer);
                const zipEntries: IZipEntry[] = zip.getEntries();
                for (const entry of zipEntries) {
                    const mimeType: string | false = mime.lookup(entry.entryName);
                    if (mimeType && mimeType.startsWith('image/')) {
                        totalNumber += 1;
                    }
                }
                totalCost = totalNumber * 0.8;
            } else {
                throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
            }
            
            const userEmail: string | undefined = req.userEmail;
            if (!userEmail) {
                throw new ConcreteErrorCreator().createBadRequestError().setMissingEmail();
            }
            
            const user: ConcreteErrorCreator | User = await this.repository.getUserByEmail(userEmail);
            
            if( user instanceof User){
                // Verifica se l'utente ha abbastanza token disponibili
                if( await this.repository.checkUserToken(user.id, totalCost)){
                    this.repository.updateUserTokenByCost(user, totalCost);
                } else {
                    throw new ConcreteErrorCreator().createForbiddenError().setInsufficientToken();
                }  
            }

            const destination: string | ConcreteErrorCreator = await this.repository.createDestinationRepo(Number(req.params.datasetId));

            if( typeof destination === 'string'){

                const mimeType: string = req.file.mimetype;

                if (mimeType.startsWith('image/')) {
                    const filePath: string = path.join(destination, `${req.file.originalname}`);
                    fs.writeFileSync(filePath, req.file.buffer);

                    this.repository.createImage({
                        "datasetId": Number(req.params.datasetId),
                        "path": filePath,
                        "description": req.body.description
                    });
                } else if (mimeType.startsWith('application/zip')) {
                    const zip: AdmZip = new AdmZip(req.file.buffer);
                    const zipEntries: IZipEntry[] = zip.getEntries();
                    await this.repository.processZipEntries(Number(req.params.datasetId),zipEntries, destination);
                } else {
                    throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
                }

                await this.repository.updateCountDataset(Number(req.params.datasetId), totalNumber);
                const result: SuccessResponse = {
                    success: true,
                    message: 'File uploaded successfully'
                }
                res.status(200).json( result);
            }
        } catch(error){
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }


    async displayResidualCredit(req: Request, res: Response){
        try {
            const userEmail: string | undefined = req.userEmail;

            if (!userEmail) {
                throw new ConcreteErrorCreator().createBadRequestError().setMissingEmail();
            }
            
            const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(userEmail);

            if( user instanceof User){
                const result : SuccessResponse = {
                    success: true,
                    message: 'Token credit',
                    obj: {
                        userEmail: user.email,
                        token: Number(user.token)
                    }
                }
                res.status(200).json(result);
            }else{
                throw user;
            }
        } catch (error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }
    
    // changes the name of a user's dataset, if he hasn't others datasets with the same name
    async updateDatasetName(req: Request, res: Response) {
        try{
            const userEmail: string | undefined = req.userEmail; 
            if( !userEmail ){
                throw new ConcreteErrorCreator().createAuthenticationError().setFailAuthUser();
            }
            const user: ConcreteErrorCreator | User = await this.repository.getUserByEmail(userEmail);
            
            if(user instanceof User) {
                if( await this.repository.checkNames(user.id, req.body.name)) {
                    const dataset: Dataset | ConcreteErrorCreator = await this.repository.updateDatasetName(Number(req.params.datasetId), req.body.name);
                    if( dataset instanceof ConcreteErrorCreator){
                        throw dataset;
                    }
                    const result: SuccessResponse = {
                        success: true,
                        message: 'Dataset updated successfully',
                        obj: dataset
                    }
                    res.status(200).json(result);
                }
            }
        } catch( error ) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }
}




    

