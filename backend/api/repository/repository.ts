// import UserDao from '../dao/userDao';
import TagDao from '../dao/tagDao';
// import Tag from '../models/tag';
import DatasetDao from '../dao/datasetDao';
// import ImageDao from '../dao/imageDao';
// import Image from '../models/image';
import AiDao from '../dao/aiDao';
import Ai from '../models/ai';
import ResultDao from '../dao/resultDao';
import Result from '../models/result';
import Image from '../models/image';
import ImageDao from '../dao/imageDao';
// import { isImage, unzipImages} from '../utils/utils'; // Importa le funzioni di utilità
// import { SequelizeConnection } from '../db/SequelizeConnection';
// import { ConcreteErrorCreator } from '../factory/ErrorCreator';
// import * as fs from 'fs';
import Dataset from '../models/dataset';
import DatasetTags from '../models/datasettag';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import path from 'path';
import fs, { PathLike } from 'fs';
import AdmZip, { IZipEntry }  from 'adm-zip';
import mime from 'mime-types';



export interface IRepository {
    // createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    // createDataset(datasetJson: any): Promise<Object>;
    // uploadFile(datasetId: number, filePath: string): Promise<Image[]>;
    // updateUserTokenByCost(userId: number, cost: number): Promise<void>;
    // checkUserToken(userId: number, amount: number): void;
    // updateUserToken(userId: number, token: number): Promise<Object>;
    // getDatasetUserList(userId: number): Promise<Object | null>;
    listAiModels(): Promise<Ai[] | null>;
    findModel(modelId: number): Promise<Ai | null>;
    findResult(resultId: number): Promise<Result | null>;
    createDatasetWithTags(data: any): Promise<Dataset> ;
    logicallyDelete(datasetId: number): Promise<Object | null>;
    updateModelWeights(modelId: number, weights: string ): Promise<Ai | null>;
    createDestinationRepo(datasetId: number): Promise<string | null> ;
    processZipEntries(datasetId: number, zipEntries: IZipEntry[], destination: string): Promise<void | null>
}


export class Repository implements IRepository {

    constructor() {};
    
    // used into the route to create a dataset
    async createDatasetWithTags(data: any): Promise<Dataset>  {
        const datasetDao = new DatasetDao();
        const tagDao = new TagDao();

        const { name, description, tags } = data; // quando avremo userid ci sarà anche quello
    
        // Generate the path
        const path = this.generatePath(name);
    
        // Create the dataset
        const newDataset = await datasetDao.create({
          name,
          description,
          path,
          countElements: 0, // Set to 0 or a default value, adjust as needed
          countClasses: tags.length,
          // userId,
        });
    
        // Associate tags with the dataset
        for (const tagName of tags) {
            const tagInstance = await tagDao.create({ name: tagName });
            // Crea un'istanza della tabella di associazione DatasetTags
            await DatasetTags.create({
                datasetId: newDataset.id,
                tagId: tagInstance.name
            });
          }
    
        return newDataset;
    }
    
    
    // NB: to move into utils.ts 
    generatePath(name: string) {
        
        // Rimuove spazi vuoti e caratteri speciali dal nome
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '');

        // Converte il nome in lowercase e sostituisci gli spazi con trattini
        const formattedName = sanitizedName.toLowerCase().replace(/\s+/g, '-');

        // Costruisce il percorso con il nome formattato
        const path = `/path/${formattedName}`;

        return path;
    }

    // lists all available Ai models
    async listAiModels(): Promise<Ai[] | null>{
        const aiDao = new AiDao();
        return aiDao.findAll();
    }

    // find an Ai model by id
    async findModel(modelId: number): Promise<Ai | null>{
        const aiDao = new AiDao();
        return aiDao.findById(modelId);
    }

    // find an inference result by id
    async findResult(resultId: number): Promise<Result | null>{
        const resultDao = new ResultDao();
        return resultDao.findById(resultId);
    }

    // Given the datasetId, deletes logically the dataset
    async logicallyDelete(datasetId: number): Promise<Object | null> {
        try{
            const datasetDao = new DatasetDao();
            return datasetDao.logicallyDelete(datasetId);
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedUpdatingItem();
        }
    };
    
    // takes an ai model identified by its id and update its property pathWeigths with the path of the new weights
    async updateModelWeights(modelId: number, weights: string ): Promise<Ai | null>  {
        const aiDao = new AiDao();
        const weightsString = String(weights);
    
        // Generate pathWeights
        const path = this.generatePath(weightsString);
    
        return aiDao.updateItem(modelId, path);
    }

    async findDatasetById(datasetId: number): Promise<Dataset | null> {
        const datasetDao = new DatasetDao();
        return datasetDao.findById(datasetId);
    }

    async createImage(data: any): Promise<Image | null> {
        const imageDao = new ImageDao();
        return imageDao.create(data);
    }

    async createDestinationRepo(datasetId: number): Promise<string | null> {
        const datasetDao = new DatasetDao();
        //const dataset = await Dataset.findByPk(datasetId);
        const dataset = await datasetDao.findById(datasetId);
        const datasetPath = dataset?.path;
        if(typeof datasetPath === 'string'){
            const destination = path.join('/app/media', datasetPath, 'img');
    
            // Assicurati che la cartella di destinazione esista
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }
            return destination;
        } else {
            throw new ConcreteErrorCreator().createServerError().setFailedCreationRepo();
        }
    }

    async processZipEntries(datasetId: number, zipEntries: IZipEntry[], destination: string): Promise<void | null> {
        try {
            zipEntries.forEach((entry: IZipEntry) => {
                const entryName = entry.entryName;
                const entryData = entry.getData();
                const mimeType = mime.lookup(entryName);
    
                if (mimeType && mimeType.startsWith('image/')) {
                    const filePath = path.join(destination, entryName);
                    fs.writeFileSync(filePath, entryData);

                    // Salva l'immagine nel database utilizzando ImageDao
                    const imageDao = new ImageDao()
                    imageDao.create({
                    datasetId: datasetId, 
                    path: entryName,
                    description: 'image'
                });
                }
            });
        } catch {
            //return false; // Restituisce false se si verifica un errore durante l'elaborazione
            throw new ConcreteErrorCreator().createServerError().setFailedUploadFile();
        }
    }




    
    
    /** 
    // Ho provato a creare un metodo che verrà usato nella rotta per l'upload di un file nel dataset
    // a seconda che il file sia un'immagine o un file zip richiama le funzioni di utilità per verificare
    // che il file sia un immagine o nel caso in cui sia un file zip eseguire l'unzip
    public async uploadFile(datasetId: number, filePath: string) {

        const sequelize = SequelizeConnection.getInstance().sequelize;
        try {
            let images;
            const imageDao = new ImageDao();

            if(isImage(filePath)) {
                const image = await imageDao.create({
                    datasetId: datasetId,
                    path: filePath
                });
                images = [image];
            } else {
                const bufferList = await unzipImages(filePath);
                images = await Promise.all(bufferList.map(async (buffer: any) => {
                    const tempFilePath = `${filePath}-${Date.now()}.img`; // Nome temporaneo per il file immagine
                    fs.writeFileSync(tempFilePath, buffer); // Scrivi il buffer su un file temporaneo
                    const img = await imageDao.create({
                        dataset_id: datasetId,
                        path: tempFilePath // Salva il percorso del file temporaneo
                    });
                    return img;
                }));
            }

            // Aggiorna il conteggio degli elementi nel dataset
            await Dataset.increment('count_elements', { where: { id: datasetId }});
            return images;
        } catch (error) {
            throw new ConcreteErrorCreator().createServerError().setFailedUploadFile();
        }
    } 

    // updates the user token amount subtracting a cost
    // checks if the user has the available amount
    public async updateUserTokenByCost(userId: number, cost: number): Promise<void> {
        const userDao = new UserDao();
        const user = await userDao.findById(userId);
        this.checkUserToken(userId, cost);
        if(user !== null){
            try {
                await user.set({ token: user.token - cost }).save();
             } catch {
                throw new ConcreteErrorCreator().createServerError().setUpdatingToken();
             }
        } else{ 
            throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
        }
    }

    // checks if the user token amount is >= requested amount
    async checkUserToken(userId: number, amount: number): Promise<void> {
        const userDao = new UserDao();
        const user = await userDao.findById(userId);
        if (user !== null && user.token < amount)
            throw new ConcreteErrorCreator().createForbiddenError().setInsufficientToken();
    }

    // updates the token amount of a specified user
    // returns the updated user
    async updateUserToken(userId: number, token: number): Promise<Object> {
        const userDao = new UserDao();
        const user = await userDao.findById(userId);
        if(user){
            await user.set({ token: token }).save();
        }else{
            throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
        }
        return { updatedUser: user };
    }
    */
    
}





    

    


