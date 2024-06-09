import { IDao } from './daoInterface';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import DatasetTags from "../models/datasettag";

export default class DatasetTagDao implements IDao<DatasetTags>{

    constructor() {}

    // given the dataset id, finds all tags associated to it
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

    // create a new instance of DatasetTag or throw an error if the creation operation failed
    async create(data: any): Promise<DatasetTags | ConcreteErrorCreator> {
        try{
            return DatasetTags.create(data);
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }

}