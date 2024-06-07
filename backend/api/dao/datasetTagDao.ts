import { IDao } from './daoInterface';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import DatasetTags from "../models/datasettag";

export default class DatasetTagDAO implements IDao<DatasetTagDAO>{

    constructor() {}

    // it creates a new Tag or throw an error if the creation operation failed
    async findAllByDatasetId(dataset: number):Promise<string[]> {
        try{
            const data :DatasetTags[] = await DatasetTags.findAll({
               where: {
                   datasetId: dataset
               },
            });
            if(data.length === 0){
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
            }
            return data.map((tag)=>tag.getDataValue('tagId'));
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }

}