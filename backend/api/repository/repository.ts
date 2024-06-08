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
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import Dataset from '../models/dataset';
import User from "../models/user";
import path from 'path';
import fs from 'fs';
import { IZipEntry }  from 'adm-zip';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import {generatePath, SuccessResponse} from "../utils/utils";
import DatasetTagDao from '../dao/datasetTagDao';
import DatasetTags from '../models/datasettag';


export interface IRepository {
    getUserById(userId: number): Promise<User | ConcreteErrorCreator>;
    getUserByEmail(userEmail: string): Promise<User | ConcreteErrorCreator>;
    getDatasetListByUserId(userId: number): Promise<Dataset[] | ConcreteErrorCreator>;
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    listAiModels(): Promise<Ai[] | ConcreteErrorCreator>;
    findModel(modelId: number): Promise<Ai | ConcreteErrorCreator>;
    findResult(resultId: number): Promise<Result | ConcreteErrorCreator>;
    listImageFromDataset(datasetId: number): Promise<Image[] | ConcreteErrorCreator>;
    createDatasetWithTags(data: any, user: User): Promise<Dataset> ;
    getDatasetDetail(datasetId: number): Promise<Dataset | ConcreteErrorCreator> ;
    logicallyDelete(datasetId: number): Promise<SuccessResponse | ConcreteErrorCreator>;
    updateModelWeights(modelId: number, weights: string ): Promise<Ai | ConcreteErrorCreator>;
    findDatasetById(datasetId: number): Promise<Dataset | ConcreteErrorCreator>;
    createImage(data: any): Promise<Image | null>;
    createDestinationRepo(datasetId: number): Promise<string | ConcreteErrorCreator> ;
    processZipEntries(datasetId: number, zipEntries: IZipEntry[], destination: string): Promise<void | ConcreteErrorCreator>;
    updateUserTokenByCost(user: User, cost: number): Promise<void>;
    checkUserToken(userId: number, amount: number): Promise<boolean>;
    generateUUID(): Promise<string>;
    getTags(datasetId: number): Promise<string[]>;
    updateCountDataset(datasetId: number, num: number): Promise<Dataset|ConcreteErrorCreator>;
    createListResult(imageList: Image[], aiID: number, UUID: string): Promise<Result[] | ConcreteErrorCreator>;
    checkNames(userId: number, newName: string): Promise<boolean | ConcreteErrorCreator>;
}


export class Repository implements IRepository {

    constructor() {};
    
    // finds a user given his id
    public async getUserById(userId: number) {
        const user: UserDao = new UserDao();
        return user.findById(userId);
    }
    
    // finds a user given his email
    public async getUserByEmail(userEmail: string): Promise<User | ConcreteErrorCreator> {
        const user: UserDao = new UserDao();
        return user.findByEmail(userEmail);
    }

    // display all datasets associated with a specified user, given his id
    public async getDatasetListByUserId(userId: number): Promise<Dataset[] | ConcreteErrorCreator> {
        const dataset: DatasetDao = new DatasetDao();
        return dataset.findAllByUserId(userId);
    }

    // method to create tags associated with a specific dataset
    public async createTags(tags: string[], datasetId: number): Promise<Tag[]> {
        const tagDao = new TagDao()
        const createdTags = await Promise.all(
          tags.map(tagName => tagDao.create({ name: tagName, datasetId }))
        );
        return createdTags;
    }

    // given a series of metadata about the dataset to create and a list of tags/strings, dataset and associated
    // tags are created on db
    async createDatasetWithTags(data: any, user: User): Promise<Dataset>  {
        const datasetDao: DatasetDao = new DatasetDao();
        const tagDao: TagDao = new TagDao();
        const datasettagDao: DatasetTagDao = new DatasetTagDao();

        const { name, description, tags } = data;

        // relative path of the repository that will be generated inside our volume when
        // uploading files inside the dataset
        const path: string = generatePath(name);

        // Creates the dataset
        const newDataset: Dataset = await datasetDao.create({
          name,
          description,
          path,
          countElements: 0, // Set to 0 or a default value, adjust as needed
          countClasses: tags.length,
          userId: user.id,
        });

        // Associates tags with the dataset
        for (const tagName of tags) {
            const tagInstance: Tag = await tagDao.create({ name: tagName });
            await datasettagDao.create(
                {
                   datasetId: newDataset.id,
                   tagId: tagInstance.name
                }
            );
        }

        return newDataset;
    }

    // lists all available Ai models
    async listAiModels(): Promise<Ai[] | ConcreteErrorCreator>{
        const aiDao: AiDao = new AiDao();
        return aiDao.findAll();
    }

    // find an Ai model by id
    async findModel(modelId: number): Promise<Ai | ConcreteErrorCreator>{
        const aiDao: AiDao = new AiDao();
        return aiDao.findById(modelId);
    }

    // find an inference result by id
    async findResult(resultId: number): Promise<Result | ConcreteErrorCreator>{
        const resultDao: ResultDao = new ResultDao();
        return resultDao.findById(resultId);
    }

    // Given the datasetId, deletes logically the dataset
    async logicallyDelete(datasetId: number): Promise<ConcreteErrorCreator| SuccessResponse>{
        try{
            const datasetDao: DatasetDao = new DatasetDao();
            return datasetDao.logicallyDelete(datasetId);
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedUpdatingItem();
        }
    };

    // takes an ai model identified by its id and update its property pathWeigths with the path of the new weights
    async updateModelWeights(modelId: number, path: string ): Promise<Ai | ConcreteErrorCreator>  {
        const aiDao: AiDao = new AiDao();
        return aiDao.updateItem(modelId, path);
    }
    
    // finds a dataset given its id
    async findDatasetById(datasetId: number): Promise<Dataset | ConcreteErrorCreator> {
        const datasetDao = new DatasetDao();
        return datasetDao.findById(datasetId);
    }
    
    // creates an instance of Image Sequelize model to save it on db
    async createImage(data: any): Promise<Image | null> {
        const imageDao = new ImageDao();
        return imageDao.create(data);
    }
    
    // creates the destination repository used for files uploaded on our volume
    async createDestinationRepo(datasetId: number): Promise<string | ConcreteErrorCreator> {
        const datasetDao = new DatasetDao();
        //const dataset = await Dataset.findByPk(datasetId);
        const dataset = await datasetDao.findById(datasetId);
        if( dataset instanceof Dataset){
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
        } else  throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
    }
    
    // processes all the images extracted from the zip file uploaded to save them on db and on volume
    async processZipEntries(datasetId: number, zipEntries: IZipEntry[], destination: string): Promise<void | ConcreteErrorCreator> {
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

    // updates the user token amount subtracting a cost
    public async updateUserTokenByCost(user: User, cost: number): Promise<void>{
        user.token -= cost;
        await user.save();
    }

    // checks if the user token amount is >= requested amount
    async checkUserToken(userId: number, amount: number): Promise<boolean> {
        const userDao = new UserDao();
        const user = await userDao.findById(userId);
        return !(user instanceof User && user.token < amount);
    }

    // finds a dataset given its id
    async getDatasetDetail(datasetId: number): Promise<Dataset | ConcreteErrorCreator> {
        try{
            const datasetDao: DatasetDao = new DatasetDao();
            const dataset: Dataset | ConcreteErrorCreator = await datasetDao.findById(datasetId);
            if( dataset !== null && dataset !== undefined ){
                return dataset
            }else{
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
            }
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
        }
    }

    // updates the number of elements of a dataset
    public async updateCountDataset(datasetId: number, num: number): Promise<Dataset|ConcreteErrorCreator> {
        const datasetDao = new DatasetDao();
        return datasetDao.updateCount(datasetId, num);
    }

    async generateUUID(): Promise<string> {
        let unique: boolean = false;
        let uuid: string = "";
        while (!unique) {
            uuid = uuidv4();
            const existingRecord: Result | null = await Result.findOne({
                where: {
                    requestId: uuid
                }
            });
            if (!existingRecord) {
                unique = true;
            }
        }
        return uuid;
    }

    // returns all tags associated to a dataset specified by its id
    async getTags(datasetId: number): Promise<string[]> {
        const datasetTagDao = new DatasetTagDao();
        return await datasetTagDao.findAllByDatasetId(datasetId);
    }

    // returns all images of a dataset specified by its id
    async listImageFromDataset(datasetId: number): Promise<Image[] | ConcreteErrorCreator> {
        const imageDao: ImageDao = new ImageDao();
        return imageDao.findAllImmagineByDatasetId(datasetId);
    }

    
    async createListResult(imageList: Image[], aiID: number, UUID: string): Promise<Result[] | ConcreteErrorCreator> {
        const results: Result[] = [];
        for (const image of imageList) {
            try {
                const res: ResultDao = new ResultDao()
                const result: Result | ConcreteErrorCreator = await res.initCreation(image.id, aiID, UUID);
                if (result instanceof ConcreteErrorCreator) {
                    throw result;
                }
                results.push(result);
            } catch (error) {
                if (error instanceof ConcreteErrorCreator) {
                    return error;
                } else {
                    throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
                }
            }
        }

        return results;
    }

    async checkNames(userId: number, newName: string): Promise<boolean | ConcreteErrorCreator> {
        const datasets = await this.getDatasetListByUserId(userId);
        let names: string[] = [];
        if (Array.isArray(datasets)){
            names = datasets.map( (dataset: Dataset) => dataset.name);
            if (!names.includes(newName)) {
                return true;
            } else {
            throw new ConcreteErrorCreator().createForbiddenError().setInvalidName();
            }
        } else{
            return datasets;
        }
    }

    async updateDatasetName( datasetId: number, newName: string ): Promise< Dataset | ConcreteErrorCreator> {
        const datasetDao: DatasetDao = new DatasetDao();
        return datasetDao.updateName(datasetId, newName);
    }

}










