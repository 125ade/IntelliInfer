import UserDao from '../dao/userDao';
import TagDao from '../dao/tagDao';
import Tag from '../models/tag';
import DatasetDao from '../dao/datasetDao';
import ImageDao from '../dao/imageDao';
import Image from '../models/image';
import AiDao from '../dao/aiDao';
import Ai from '../models/ai';
import ResultDao from '../dao/resultDao';
import Result from '../models/result';
import { isImage, unzipImages, generatePath } from '../utils/utils'; // Importa le funzioni di utilità
import { SequelizeConnection } from '../db/SequelizeConnection';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import * as fs from 'fs';
import Dataset from '../models/dataset';



export interface IRepository {
    // createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    createDataset(datasetJson: any): Promise<Object>;
    uploadFile(datasetId: number, filePath: string): Promise<Image[]>;
    updateUserTokenByCost(userId: number, cost: number): Promise<void>;
    checkUserToken(userId: number, amount: number): void;
    updateUserToken(userId: number, token: number): Promise<Object>;
    getDatasetUserList(userId: number): Promise<Object | null>;
    listAiModels(): Promise<Ai[] | null>;
    findModel(modelId: number): Promise<Ai | null>;
    findResult(resultId: number): Promise<Result | null>;
}


export class Repository implements IRepository {

    constructor() {};
    

    // function that creates a dataset given the informations passed by the user
    public async createDataset(datasetJson: any): Promise<{ dataset: Dataset, tags: Tag[] }> {
        try {
          // Estrai i tag e il nome dal JSON
          const { tags, name, description } = datasetJson;
          
          
          const nameDataset = String(name);
          const descriptionDataset = String(description);
          const pathdataset = await generatePath(nameDataset);
    
          const datasetData: any = {
            "name": nameDataset,
            "description": descriptionDataset,
            "path": pathdataset,
            "countElements": 0,  // Supponendo che inizialmente sia 0
            "countClasses": tags.length,  // Numero di classi uguale al numero di tag
            "userId": 1  // Supponendo un userId statico per esempio; dovresti sostituirlo con il reale userId
          };
    
          // Crea il dataset nel database
          const datasetDao = new DatasetDao();
          const dataset = await datasetDao.create(datasetData);
    
          // Crea i tag
          const tagDao = new TagDao();
          const createdTags: Tag[] = tags.map( async (tag: string) => await tagDao.create({"name": tag}));
          
          // associa i tags al dataset
          createdTags.forEach( (tag: Tag) => { dataset.addTag(tag)});
    
          return { dataset: dataset, tags: createdTags };
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    
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
    

    async getDatasetUserList(userId: number): Promise<Object | null> {
        try {
            const datasetDao = new DatasetDao();
            return await datasetDao.findById(userId);
        }catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    };

    
    

}
// todo: methods to update model weights




    

    


