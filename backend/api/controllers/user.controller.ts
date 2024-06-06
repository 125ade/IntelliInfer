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



export default class UserController {

    private repository: Repository;

    constructor() {
        this.repository = new Repository();
    }

    async modelList(req: Request, res: Response) {
        try {
            const aiModels = await this.repository.listAiModels();
            res.status(200).json(aiModels);
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
            const token = req.headers.authorization
            if (token !== undefined){
                const decode = decodeToken(token.split(' ')[1]);
                if (decode.email) {
                    const user = await this.repository.getUserByEmail(decode.email);
                    if (user && user instanceof User) {
                        const datasetList = await this.repository.getDatasetListByUserId(user.id);
                        res.status(200).json({list: datasetList});
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
                const datasetId = Number(req.params.datasetId);
                const dataset = await this.repository.getDatasetDetail(datasetId);
                if (dataset !== null && dataset !== undefined && !(dataset instanceof ErrorCode)){
                    res.status(200).json(dataset);
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
            const aiModel = await this.repository.findModel(modelId);
            res.status(200).json(aiModel);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // console.log(error);
                throw new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async findResultById(req: Request, res: Response) {
        try {
            const resultId: number = Number(req.params.resultId);
            const inferenceResult = await this.repository.findResult(resultId);
            res.status(200).json(inferenceResult);
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
            const token = req.headers.authorization
            if (token !== undefined){
                const decode = decodeToken(token.split(' ')[1]);
                if (decode.email) {
                    const user = await this.repository.getUserByEmail(decode.email);
                    if (user && user instanceof User) {
                        const result = await this.repository.createDatasetWithTags(req.body, user);
                        return res.status(201).json(result);
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
                // console.log(error);
                throw new ConcreteErrorCreator().createServerError().setFailedCreationItem().send(res);
            }
        }
    }

    async deleteDatasetById(req: Request, res: Response) {
        try{
            const result = await this.repository.logicallyDelete(Number(req.params.datasetId));
            return res.status(201).json(result);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // console.log(error);
                throw new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    // route to upload a single image on volume, and on database
    async uploadImage(req: Request, res: Response) {
        try{
            if (!req.file) {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentFile();
            }

            const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
            if( typeof destination === 'string'){

                const mimeType = req.file.mimetype;
                if (mimeType.startsWith('image/')) {

                        const filePath = path.join(destination, `${req.file.originalname}`);
                        fs.writeFileSync(filePath, req.file.buffer);

                        this.repository.createImage({
                            "datasetId": Number(req.params.datasetId),
                            "path": filePath,
                            "description": req.body.description
                          });

                        res.status(200).json({ Result: 'File uploaded successfully.'});
                };
            }
        } catch(error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
            }
        }
    }


    // route to upload a file zip on volume and on database
    async uploadZip(req: Request, res: Response) {
        try{
            if (!req.file) {
                throw new ConcreteErrorCreator().createBadRequestError().setAbsentFile();
            }

            const zip = new AdmZip(req.file.buffer);
            const zipEntries: IZipEntry[] = zip.getEntries();

            const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
            if(typeof destination === 'string'){
                await this.repository.processZipEntries(Number(req.params.datasetId),zipEntries, destination);
                res.status(200).json( { Result: 'File uploaded successfully'})
            }
        } catch(error) {
            if( error instanceof ErrorCode){
                error.send(res);
            } else {
                new ConcreteErrorCreator().createServerError().setFailedUploadFile().send(res);
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
            let totalCost = 0;
            if (req.file.mimetype.startsWith('image/')) {
                totalCost += 0.75;
            } else if (req.file.mimetype.startsWith('application/zip')) {
                const zip = new AdmZip(req.file.buffer);
                const zipEntries: IZipEntry[] = zip.getEntries();
                for (const entry of zipEntries) {
                    const mimeType = mime.lookup(entry.entryName);
                    if (mimeType && mimeType.startsWith('image/')) {
                        totalCost += 0.8;
                    }
                }
            } else {
                throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
            }
            
            const userEmail = req.userEmail;

            if (!userEmail) {
                throw new ConcreteErrorCreator().createBadRequestError().setMissingEmail();
            }
            
            const user = await this.repository.getUserByEmail(userEmail);
            
            if( user instanceof User){
                // Verifica se l'utente ha abbastanza token disponibili
                if (user.token < totalCost) {
                    throw new ConcreteErrorCreator().createForbiddenError().setInsufficientToken();
                }  else {
                    // Sottrai il costo totale dai token dell'utente
                    user.token -= totalCost;
                    await user.save(); // Salva l'utente con il saldo aggiornato
                }
            }

            const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));

            if( typeof destination === 'string'){

                const mimeType = req.file.mimetype;

                if (mimeType.startsWith('image/')) {
                    const filePath = path.join(destination, `${req.file.originalname}`);
                    fs.writeFileSync(filePath, req.file.buffer);

                    this.repository.createImage({
                        "datasetId": Number(req.params.datasetId),
                        "path": filePath,
                        "description": req.body.description
                    });
                } else if (mimeType.startsWith('application/zip')) {
                    const zip = new AdmZip(req.file.buffer);
                    const zipEntries: IZipEntry[] = zip.getEntries();
                    await this.repository.processZipEntries(Number(req.params.datasetId),zipEntries, destination);
                } else {
                    throw new ConcreteErrorCreator().createBadRequestError().setNotSupportedFile();
                }
                res.status(200).json( { Result: 'File uploaded successfully'}); // todo: success interface
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
            const userEmail = req.userEmail;

            if (!userEmail) {
                throw new ConcreteErrorCreator().createBadRequestError().setMissingEmail();
            }
            
            const user = await this.repository.getUserByEmail(userEmail);

            if( user instanceof User){
                res.status(200).json({ token: user.token });
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




    

