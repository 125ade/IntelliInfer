import User from '../models/user'
import Image from '../models/image'
import Ai from '../models/ai'
import Dataset from '../models/dataset'
import Tag from '../models/tag'
import { isImage, unzipImages } from '../utils/utils'; // Importa le funzioni di utilità
import { SequelizeConnection } from '../db/SequelizeConnection';
import { ConcreteErrorCreator } from '../factory/ErrorCreator'
import * as fs from 'fs';


export interface IRepository {
    findAllModels(): Promise<Ai[]>;
    findAllDatasets(): Promise<Dataset[]>;
    findModelById(id: number): Promise<Ai | null>;
    findDatasetById(id: number): Promise<Dataset | null>;
    updateDataset(id: number, datasetData: Partial<Dataset>): Promise<void>;
    deleteDataset(dataset: Dataset): Promise<Object>;
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    createDataset(datasetJson: any): Promise<Object>;
    uploadFile(datasetId: number, filePath: string): Promise<Image[]>;
    updateUserTokenByCost(user: User, cost: number): Promise<void>;
    checkUserToken(user: User, amount: number): void;
    updateUserToken(user: User, token: number): Promise<Object> ;
}


class Repository implements IRepository {

    // all actions require a default user
    private user: User;

    constructor(user: User) {
       this.user = user;
    }
    
    // method that lists all Ai models on the database
    public async findAllModels(): Promise<Ai[]> {
        return Ai.findAll();
    }
    
    // method that lists all datasets on the database
    public async findAllDatasets(): Promise<Dataset[]> {
        return Dataset.findAll();
    }
    
    // method to obtain a specific AiModel by Id
    public async findModelById(id: number): Promise<Ai | null> {
        return Ai.findByPk(id);
    }
    
    // method to obtain a specific dataset by Id
    public async findDatasetById(id: number): Promise<Dataset | null> {
        return Dataset.findByPk(id);
    }
    
    // method to update a specific dataset by id given parcial data
    public async updateDataset(id: number, datasetData: Partial<Dataset>): Promise<void> {
        await Image.update(datasetData, { where: { id } });
    }
    
    // logically deletes a dataset
    // returns the deleted dataset
    public async deleteDataset(dataset: Dataset): Promise<Object> {
       await dataset.set({ isDeleted: true }).save();
       return { deletedDataset: dataset };
    }

    // method to create tags associated with a specific dataset
    public async createTags(tags: string[], datasetId: number): Promise<Tag[]> {
        const createdTags = await Promise.all(
          tags.map(tagName => Tag.create({ name: tagName, datasetId }))
        );
        return createdTags;
    }

    public async createDataset(datasetJson: any): Promise<{ dataset: Dataset, tags: Tag[] }> {
        try {
          let tags = datasetJson.tags;
    
          // set creation and update date
          const now = new Date();
          datasetJson.createdAt = now;
          datasetJson.updatedAt = now;
    
          // add user id
          datasetJson.userId = this.user.id;
    
          // Crea il dataset nel database
          const dataset = await Dataset.create(datasetJson);
    
          // Crea i tag, rimuovendo i duplicati
          const uniqueTags: string[] = [...new Set(tags as string[])];
          const createdTags = await this.createTags(uniqueTags, dataset.id);
    
          return { dataset: dataset, tags: createdTags };
        } catch (error) {
          console.error('Error creating dataset:', error);
          throw new Error('Failed to create dataset');
        }
    }
    

    // Ho provato a creare un metodo che verrà usato nella rotta per l'upload di un file nel dataset
    // a seconda che il file sia un'immagine o un file zip richiama le funzioni di utilità per verificare
    // che il file sia un immagine o nel caso in cui sia un file zip eseguire l'unzip
    public async uploadFile(datasetId: number, filePath: string) {

        const sequelize = SequelizeConnection.getInstance().sequelize;

        const t = await sequelize.transaction();
        try {
            let images;

            if(isImage(filePath)) {
                const image = await Image.create({
                    datasetId: datasetId,
                    path: filePath
                }, { transaction: t });
                images = [image];
            } else {
                const bufferList = await unzipImages(filePath);
                images = await Promise.all(bufferList.map(async (buffer: any) => {
                    const tempFilePath = `${filePath}-${Date.now()}.img`; // Nome temporaneo per il file immagine
                    fs.writeFileSync(tempFilePath, buffer); // Scrivi il buffer su un file temporaneo
                    const img = await Image.create({
                        dataset_id: datasetId,
                        path: tempFilePath // Salva il percorso del file temporaneo
                    }, { transaction: t });
                    return img;
                }));
            }

            // Aggiorna il conteggio degli elementi nel dataset
            await Dataset.increment('count_elements', { where: { id: datasetId }, transaction: t });

            // Commit della transazione
            await t.commit();

            return images;
        } catch (error) {
            // Rollback della transazione in caso di errore
            await t.rollback();
            throw error;
        }
    }


    // updates the user token amount subtracting a cost
    // checks if the user has the available amount
    public async updateUserTokenByCost(user: User, cost: number): Promise<void> {
        this.checkUserToken(user, cost);

        try {
           await this.user.set({ token: this.user.token - cost }).save();
        } catch (err) {
           throw new ConcreteErrorCreator().createServerError().setUpdatingToken();
        }
    }

    // checks if the user token amount is >= requested amount
    checkUserToken(user: User, amount: number): void {
        if (user.token < amount)
            throw new ConcreteErrorCreator().createForbiddenError().setNeedMoreToken(amount);
    }

    // updates the token amount of a specified user
    // returns the updated user
    async updateUserToken(user: User, token: number): Promise<Object> {
        await user.set({ token: token }).save();

        return { updatedUser: user };
    }
}
// NB: to do: methods to update model weights




    

    


