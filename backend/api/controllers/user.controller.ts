import {Response, Request} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import Dataset from "../models/dataset";
import Image from "../models/image";
import fs, { PathLike } from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import { checkMimeType } from "../utils/utils";
import AdmZip, { IZipEntry }  from 'adm-zip';
import mime from 'mime-types';
import ImageDao from "../dao/imageDao";
import User from "../models/user";
import {decodeToken} from "../token";


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

    async uploadImage(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: 'File must be provided' });
        }

        const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
        if( typeof destination === 'string'){

            const mimeType = req.file.mimetype;
            if (mimeType.startsWith('image/')) {
                try{
                    // Salva il file nella directory di destinazione
                    const filePath = path.join(destination, `${req.file.originalname}`);
                    fs.writeFileSync(filePath, req.file.buffer);

                    const imageDao = new ImageDao;
                    imageDao.create({
                        "datasetId": Number(req.params.datasetId),
                        "path": filePath,
                        "description": req.body.description
                      });

                    // Invia una risposta di successo
                    res.send('File uploaded successfully.');

                } catch (error) {
                    res.status(500).send(`An error occurred while uploading file: ${error}`);
                }
            } else {
                res.status(500).send('Error: an image must be provided.');
            }
        };
    }



    async uploadZip(req: Request, res: Response) {
            if (!req.file) {
                return res.status(400).json({ error: 'File must be provided' });
            } else{

            const zip = new AdmZip(req.file.buffer);
            const zipEntries: IZipEntry[] = zip.getEntries();

            try{
                const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
                if(typeof destination === 'string'){
                await this.repository.processZipEntries(Number(req.params.datasetId),zipEntries, destination);
                res.send('File uploaded successfully')
                }
            } catch(err) {
                if( err instanceof ErrorCode){
                    err.send(res);
                }
            }
        }
    };


    async uploadFile(req: Request, res: Response){
        if (!req.file) {
            return res.status(400).json({ error: 'File must be provided' });
        }

        const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
        if( typeof destination === 'string'){

            const mimeType = req.file.mimetype;

            if (mimeType.startsWith('image/')) {
                try{
                    // Salva il file nella directory di destinazione
                    const filePath = path.join(destination, `${req.file.originalname}`);
                    fs.writeFileSync(filePath, req.file.buffer);

                    // Invia una risposta di successo
                    res.send('File uploaded successfully.');
                } catch (error) {
                    res.status(500).send(`Error on uploading file: ${error}`);
                }
            } else if (mimeType.startsWith('application/zip')) {
                try{
                    const zip = new AdmZip(req.file.buffer);
                    const zipEntries: IZipEntry[] = zip.getEntries();
                    await this.repository.processZipEntries(Number(req.params.datasetId), zipEntries, destination);
                    res.send('File uploaded successfully.');
                } catch(error){
                    res.status(500).send(`Errore on uploading file: ${error}`);
                }
            } else {
                res.status(500).send('File format not supported');
            }
        }
    }
}




    

