import {Response, Request} from "express";
import { Repository } from '../repository/repository';
import  { ErrorCode } from "../factory/ErrorCode";
import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import Dataset from "../models/dataset";
import Image from "../models/image";
import fs, { PathLike } from 'fs';
import path from 'path';

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
                // console.log(error);
                new ConcreteErrorCreator().createServerError().set("Internal Server Error").send(res);
            }
        }
    }

    async findModelById(req: Request, res: Response) {
        try {
            const modelId: number = Number(req.params.modelId);
            const aiModel = await this.repository.findModel(modelId);
            res.status(200).json(aiModel);
        } catch (error) {
            if (error instanceof ErrorCode) {
                error.send(res);
            } else {
                // console.log(error);
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

    async uploadFile(req: Request, res: Response) {
        try {
            const datasetId = req.params.datasetId;

            // Verifica che il campo 'file' sia definito nella richiesta
            if (!req.file) {
                return res.status(400).json({ error: 'Nessun file caricato' });
            }
            
            const dataset = await this.repository.findDatasetById(Number(datasetId));
            if (!dataset) {
                return res.status(404).json({ error: 'Il dataset specificato non esiste' });
            }

            const imagePath = req.file.path;
            
            // Creazione dell'immagine
            await this.repository.createImage({
                datasetId: datasetId,
                path: imagePath,
                description: req.body.description // Assicurati che il body della richiesta contenga la descrizione
            });
            
            res.status(200).json({ message: 'Immagine caricata con successo' });

        } catch (error) {
            console.error('Errore durante l\'upload dell\'immagine:', error);
            res.status(500).json({ error: 'Errore durante l\'upload dell\'immagine' });
        }
    };
}
    



    

