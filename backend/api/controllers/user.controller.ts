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
        // try {
        //     const userId =
        // }catch (error){
        //
        // }
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
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
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
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async createDataset(req: Request, res: Response) {
        try{
            const result = await this.repository.createDatasetWithTags(req.body);
            return res.status(201).json(result);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
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
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async uploadImage(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
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
                    res.send('File caricato e processato con successo.');
                } catch (error) {
                    res.status(500).send(`Errore nel caricamento del file: ${error}`);
                }
            } else {
                res.status(500).send('Il file caricato non è un\'immagine.');
            }
        };
    }



async uploadZip (req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).send('Nessun file caricato.');
        }

        const zip = new AdmZip(req.file.buffer);
        const zipEntries: IZipEntry[] = zip.getEntries();

        const destination = await this.repository.createDestinationRepo(Number(req.params.datasetId));
        if( typeof destination === 'string'){

            zipEntries.forEach((entry: IZipEntry) => {
                const entryName = entry.entryName;
                const entryData = entry.getData();
                const mimeType = mime.lookup(entryName);

                if (mimeType && mimeType.startsWith('image/')) {
                    const filePath = path.join(destination, entryName);
                    fs.writeFileSync(filePath, entryData);
                }
            });

            res.send('File caricato e processato con successo.');
        };
    };


    async uploadFile(req: Request, res: Response){
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
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
                    res.send('File caricato e processato con successo.');
                } catch (error) {
                    res.status(500).send(`Errore nel caricamento del file: ${error}`);
                }
            } else if (mimeType.startsWith('application/zip')) {
                const zip = new AdmZip(req.file.buffer);
                const zipEntries: IZipEntry[] = zip.getEntries();

                zipEntries.forEach((entry: IZipEntry) => {
                    const entryName = entry.entryName;
                    const entryData = entry.getData();
                    const mimeType = mime.lookup(entryName);

                    if (mimeType && mimeType.startsWith('image/')) {
                        const filePath = path.join(destination, entryName);
                        fs.writeFileSync(filePath, entryData);
                    }
                });
                res.send('File caricato e processato con successo.');
            } else {
                res.status(500).send('Il file caricato non è un\'immagine.');
            }
        }
    }
}




    

