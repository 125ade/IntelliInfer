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
import {DataResultInterface, FinishResult, JobReturnData} from "../queues/jobData";


export interface IRepository {
    getUserById(userId: number): Promise<User | ConcreteErrorCreator>;
    getUserByEmail(userEmail: string): Promise<User | ConcreteErrorCreator>;
    getDatasetListByUserId(userId: number): Promise<Dataset[] | ConcreteErrorCreator>;
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    listAiModels(): Promise<Ai[] | ConcreteErrorCreator>;
    findModel(modelId: number): Promise<Ai | ConcreteErrorCreator>;
    findResult(uuid: string): Promise<Result[] | ConcreteErrorCreator>;
    listImageFromDataset(datasetId: number): Promise<Image[] | ConcreteErrorCreator>;
    createDatasetWithTags(data: any, user: User): Promise<Dataset | ConcreteErrorCreator> ;
    getDatasetDetail(datasetId: number): Promise<Dataset | ConcreteErrorCreator> ;
    logicallyDelete(datasetId: number): Promise<Dataset | ConcreteErrorCreator>;
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
    updateListResult(result:FinishResult[]): Promise<boolean | ConcreteErrorCreator>;
    checkNames(userId: number, newName: string): Promise<boolean | ConcreteErrorCreator>;
    updateDatasetName( datasetId: number, newName: string ): Promise< Dataset | ConcreteErrorCreator>;
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
    async createDatasetWithTags(data: any, user: User): Promise<Dataset | ConcreteErrorCreator>  {
        const datasetDao: DatasetDao = new DatasetDao();
        const tagDao: TagDao = new TagDao();
        const datasettagDao: DatasetTagDao = new DatasetTagDao();

        const { name, description, tags } = data;

        // relative path of the repository that will be generated inside our volume when
        // uploading files inside the dataset
        const path: string = generatePath(name);

        // Creates the dataset
        const newDataset: Dataset | ConcreteErrorCreator = await datasetDao.create({
          name,
          description,
          path,
          countElements: 0,
          countClasses: tags.length,
          userId: user.id,
        });
        if ( newDataset instanceof ConcreteErrorCreator){
            return newDataset;
        }

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
    async findResult(uuid: string): Promise<Result[] | ConcreteErrorCreator>{
        const resultDao: ResultDao = new ResultDao();
        return resultDao.findAllByUUID(uuid);
    }

    // Given the datasetId, deletes logically the dataset
    async logicallyDelete(datasetId: number): Promise<ConcreteErrorCreator| Dataset>{
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
        const datasetDao: DatasetDao = new DatasetDao();
        return datasetDao.findById(datasetId);
    }
    
    // creates an instance of Image Sequelize model to save it on db
    async createImage(data: any): Promise<Image | null> {
        const imageDao: ImageDao = new ImageDao();
        return imageDao.create(data);
    }
    
    // creates the destination repository used for files uploaded on our volume
    async createDestinationRepo(datasetId: number): Promise<string | ConcreteErrorCreator> {
        const datasetDao: DatasetDao = new DatasetDao();
        const dataset: ConcreteErrorCreator | Dataset = await datasetDao.findById(datasetId);
        if( dataset instanceof Dataset){
            const datasetPath: string = dataset?.path;
            if(typeof datasetPath === 'string'){
                const destination: string = path.join('/app/media', datasetPath, 'img');
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
                const entryName: string = entry.entryName;
                const entryData: Buffer = entry.getData();
                const mimeType: string | false = mime.lookup(entryName);
    
                if (mimeType && mimeType.startsWith('image/')) {
                    const filePath: string = path.join(destination, entryName);
                    fs.writeFileSync(filePath, entryData);

                    const imageDao: ImageDao = new ImageDao()
                    imageDao.create({
                    datasetId: datasetId, 
                    path: entryName,
                    description: 'image'
                });
                }
            });
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedUploadFile();
        }
    }

    // updates the user token amount subtracting a cost
    public async updateUserTokenByCost(user: User, cost: number): Promise<void>{
        user.token = Number(user.token) - cost;
        await user.save();
    }

    // checks if the user token amount is >= requested amount
    async checkUserToken(userId: number, amount: number): Promise<boolean> {
        const userDao: UserDao = new UserDao();
        const user: User | ConcreteErrorCreator = await userDao.findById(userId);
        return !(user instanceof User && Number(user.token) <= amount);
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
        const datasetDao: DatasetDao = new DatasetDao();
        return datasetDao.updateCount(datasetId, num);
    }

    async generateUUID(): Promise<string> {
        const resuldDao: ResultDao = new ResultDao();
        let unique: boolean = false;
        let uuid: string = "";
        while (!unique) {
            uuid = uuidv4();
            if(!(await resuldDao.findOneByResultId(uuid))){
                unique = true;
            }
        }
        return uuid;
    }

    // returns all tags associated to a dataset specified by its id
    async getTags(datasetId: number): Promise<string[]> {
        const datasetTagDao: DatasetTagDao = new DatasetTagDao();
        return await datasetTagDao.findAllByDatasetId(datasetId);
    }

    // returns all images of a dataset specified by its id
    async listImageFromDataset(datasetId: number): Promise<Image[] | ConcreteErrorCreator> {
        const imageDao: ImageDao = new ImageDao();
        return imageDao.findAllImmagineByDatasetId(datasetId);
    }

    
    // given the list of images, the ai model and job uuid, generates an array of parcial results
    async createListResult(imageList: Image[], aiID: number, UUID: string): Promise<Result[] | ConcreteErrorCreator> {
        const results: Result[] = [];
        const res: ResultDao = new ResultDao()
        for (const image of imageList) {
            try {
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

    async updateListResult(result: FinishResult[]): Promise<boolean | ConcreteErrorCreator>{
        const resultDao: ResultDao = new ResultDao()
        for (const ris of result) {
            try {
                const result: number | ConcreteErrorCreator = await resultDao.finalizeCreation(ris);
                if (result instanceof ConcreteErrorCreator) {
                    throw result;
                }
            } catch (error) {
                if (error instanceof ConcreteErrorCreator) {
                    return error;
                } else {
                    throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
                }
            }
        }
        return true;
    }

    // verifies if all datasets associated to a user have a given name
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

    // updates a dataset's name
    async updateDatasetName( datasetId: number, newName: string ): Promise< Dataset | ConcreteErrorCreator> {
        const datasetDao: DatasetDao = new DatasetDao();
        return datasetDao.updateName(datasetId, newName);
    }

    async findResultByUuidAndImageId(uuid: string, imageId: number): Promise<Result | ConcreteErrorCreator> {
        const resultDao: ResultDao = new ResultDao();
        return resultDao.findAllByUuidAndImage(uuid, imageId);
    }

    async getImagePathFromId(id: number): Promise< string | ConcreteErrorCreator >{
        const imageDao: ImageDao = new ImageDao();
        const img: Image | ConcreteErrorCreator =  await imageDao.findById(id);
        if (img instanceof Image) {
            return img.path;
        }else{
            return img
        }
    }


    async drawImageWithBBoxes(result: any) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.error('Failed to get 2D context');
            return;
        }

        if (result.data.error !== undefined || result.data.start !== false || result.data.finish !== true) {
            console.error('Invalid result data');
            return;
        }
    
        // Get image path from ID
        const imagePath = await this.getImagePathFromId(result.imageId);
        if (typeof imagePath !== 'string') {
            console.error('Failed to retrieve image path');
            return;
        }
    
        const response = await fetch(`/path/to/volume/${imagePath}`);
        if (!response.ok) {
            throw new Error('Failed to fetch image from volume');
        }

        const blob = await response.blob();
        const img: HTMLImageElement = new window.Image();
        img.src = URL.createObjectURL(blob);
    
        img.onload = () => {
            canvas.width = img.width * 2; // original + annotated
            canvas.height = img.height;
    
            // Draw original image on the left side
            ctx.drawImage(img, 0, 0, img.width, img.height);
    
            // Draw image again on the right side for annotations
            ctx.drawImage(img, img.width, 0, img.width, img.height);
    
            // Draw bounding boxes on the right side
            if (result.data.box && Array.isArray(result.data.box)) {
                result.data.box.forEach((bbox: any) => {
                    const { x_center, y_center, width, height, class_id, confidence } = bbox;
    
                    const x = (x_center - width / 2) * img.width;
                    const y = (y_center - height / 2) * img.height;
                    const w = width * img.width;
                    const h = height * img.height;
    
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + img.width, y, w, h);
    
                    ctx.fillStyle = 'red';
                    ctx.font = '20px Arial';
                    ctx.fillText(`Class: ${class_id}, Conf: ${(confidence * 100).toFixed(2)}%`, x + img.width, y - 5);
                });
            }
    
            document.body.appendChild(canvas);
        };
    
        img.onerror = () => {
            console.error('Failed to load image');
        };
    }
    


}










