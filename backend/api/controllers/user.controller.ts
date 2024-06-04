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

    async uploadImage(req: Request, res: Response) {
        try {
            const datasetId = req.params.datasetId;

            // Verifica che il campo 'file' sia definito nella richiesta
            if (!req.file) {
                return res.status(400).json({ error: 'Nessun file caricato' });
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
    
     
    async uploadZip(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).send('Nessun file caricato.');
        }
    
        const zipFile = req.file;

        const datasetId = req.params.datasetId;
        const dataset = await Dataset.findByPk(datasetId);
        const datasetPath = dataset?.path;

        if( typeof datasetPath === 'string'){
        const destination = path.join('/app/media/', datasetPath, 'img');
        // Estrarre il contenuto del file zip
        try {
            //await fs.promises.mkdir(targetPath, { recursive: true });
            await fs.createReadStream(zipFile.path)
                .pipe(unzipper.Extract({ path: destination }))
                .promise();
            fs.unlinkSync(zipFile.path);
            res.send('File unzippato e salvato correttamente.');
        } catch (error) {
            console.error('Errore durante l\'unzipping del file:', error);
            res.status(500).send('Errore durante l\'unzipping del file.');
        }

        const files = await fs.promises.readdir(destination);

        for (const file of files) {
            const filePath = path.join(destination, file);

            // Eseguo le operazioni desiderate su ciascun file estratto
            // Creo l'immagine e la salvo nel database.

            console.log('File estratto:', filePath);
            try {
                await this.repository.createImage({
                    datasetId: datasetId,
                    path: filePath,
                    description: 'file'
                });
                console.log('Immagine creata per il file:', filePath);
            } catch (createError) {
                console.error('Errore durante la creazione dell\'immagine:', createError);
            }
        }
        }
    }

    async uploadFile(req: Request, res: Response){

        // controllo che il file sia stato inserito, altrimenti lancio un errore
        if (!req.file) {
            return res.status(400).send('Nessun file caricato.');
        }
        
        const fileName: string = req.file.filename;
        console.log(fileName);


        // creo una nuova cartella con informazioni sul dataset ricavato dall'id dell'utente
        const datasetId = req.params.datasetId;
        const dataset = await Dataset.findByPk(datasetId);
        const datasetPath = dataset?.path;
        console.log(datasetPath);

        if( typeof datasetPath === 'string'){
            const destination = path.join('/app/media/img/', datasetPath);
            console.log(destination);
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }
            
            // controllo il mimetype e a seconda di che file è lo salvo direttamente o faccio l'unzip
            if( checkMimeType(fileName) === "img") {
                // Leggi il contenuto del file sorgente
                const originalPath = req.file.path;
                const originalfile = fs.readFileSync(originalPath);
                const destinationPath = path.join(destination, fileName);
                fs.writeFileSync(destinationPath, originalfile);
                fs.unlinkSync(originalPath);
                res.send(`File spostato da ${req.file.path} a ${destination}`);
            }
            else if( checkMimeType(fileName) === "zip" ) {
                try {
                    await fs.createReadStream(req.file.path)
                        .pipe(unzipper.Extract({ path: destination }))
                        .promise();
                    fs.unlinkSync(req.file.path);
                    res.send('File unzippato e salvato correttamente.');
                } catch (error) {
                    console.error('Errore durante l\'unzipping del file:', error);
                    res.status(500).send('Errore durante l\'unzipping del file.');
                }
            }
            else {
                fs.unlinkSync(req.file.path);
                res.send('File non supportato');
            }
            
            // ora che tutte le immagini sono nella cartella giusta, itero lungo la cartella e le salvo nel db
            const files = await fs.promises.readdir(destination);

            for (const file of files) {
                const filePath = path.join(destination, file);

                console.log('File estratto:', filePath);
                try {
                    await this.repository.createImage({
                        datasetId: datasetId,
                        path: filePath,
                        description: 'file'
                    });
                    console.log('Immagine creata per il file:', filePath);
                } catch (createError) {
                    console.error('Errore durante la creazione dell\'immagine:', createError);
                }
            }
        }
    }
}
    



    

