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
import { isImage, unzipImages } from '../utils/utils'; // Importa le funzioni di utilità
import { SequelizeConnection } from '../db/SequelizeConnection';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import * as fs from 'fs';
import Dataset from '../models/dataset';



export interface IRepository {
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    createDataset(datasetJson: any): Promise<Object>;
    uploadFile(datasetId: number, filePath: string): Promise<Image[]>;
    updateUserTokenByCost(userId: number, cost: number): Promise<void>;
    checkUserToken(userId: number, amount: number): void;
    updateUserToken(userId: number, token: number): Promise<Object> ;
    listAiModels(): Promise<Ai[] | null>;
    findModel(modelId: number): Promise<Ai | null>;
    findResult(resultId: number): Promise<Result | null>;
}


export class Repository implements IRepository {

    constructor() {};

    // method to create tags associated with a specific dataset
    public async createTags(tags: string[], datasetId: number): Promise<Tag[]> {
        const tagDao = new TagDao()
        const createdTags = await Promise.all(
          tags.map(tagName => tagDao.create({ name: tagName, datasetId }))
        );
        return createdTags;
    }

    // funzione da ricontrollare
    public async createDataset(datasetJson: any): Promise<{ dataset: Dataset, tags: Tag[] }> {
        try {
          // quando passo il json con il dataset passo anche il tag o i tags che voglio associargli
          let tags = datasetJson.tags;
    
          // set creation and update date
          const now = new Date();
          datasetJson.createdAt = now;
          datasetJson.updatedAt = now;
    
          // add user id
          //datasetJson.userId = this.user.id;
    
          // Crea il dataset nel database
          const datasetDao = new DatasetDao();
          const dataset = await datasetDao.create(datasetJson);
    
          // Crea i tag, rimuovendo i duplicati
          const uniqueTags: string[] = [...new Set(tags as string[])];
          const createdTags = await this.createTags(uniqueTags, dataset.id);
          
          // associa i tags al dataset
          createdTags.forEach( tag => { dataset.addTag(tag)});
    
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
    

    
    

}
// todo: methods to update model weights




    

    


