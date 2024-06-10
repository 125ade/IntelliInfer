import {IDao} from './daoInterface';
import Dataset from '../models/dataset';
import {ConcreteErrorCreator} from '../factory/ErrorCreator';
import {SuccessResponse} from "../utils/utils";

export default class DatasetDao implements IDao<Dataset> {

    constructor() {}
    
    // creates a dataset with informations given by datasetJson
    async create(datasetJson: any): Promise<Dataset | ConcreteErrorCreator> {
        try{
            const dataset: Dataset = await Dataset.create(datasetJson);
            return dataset;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // returns all datasets on database
    async findAll(): Promise<Dataset[] | ConcreteErrorCreator> {
          const datasets: Dataset[] = await Dataset.findAll({
            where: {
              isDeleted: false
            }
          });
          if( datasets.length !== 0){
            return datasets;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }
    
    // returns all datasets associated to a specific userId on database
    async findAllByUserId(user_id: number): Promise<Dataset[] | ConcreteErrorCreator> {
        const datasets: Dataset[] = await Dataset.findAll({
                where: {
                    userId: user_id,
                    isDeleted: false
                }
            });
        if( datasets.length !== 0){
            return datasets;
        } else{
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
   
    // find a dataset given its id
    async findById(datasetId: number): Promise<Dataset | ConcreteErrorCreator> {
            const dataset: Dataset | null = await Dataset.findOne({
                where: {
                    id: datasetId,
                    isDeleted: false
                }
            });
            if( dataset instanceof Dataset){
                return dataset;
            }
            else  throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
    }
    

    // logically deletes a dataset (sets isDeleted to true)
    async logicallyDelete(datasetId: number){
        try{
            const [numberOfAffectedRows, affectedRows] = await Dataset.update(
                { isDeleted: true },
                {
                    where: { id: datasetId },
                    returning: true
                }
            ) as [number, Dataset[]];

            if (numberOfAffectedRows === 0) {
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
            }
            return  affectedRows[0] ;
        } catch (error) {
            if(error instanceof ConcreteErrorCreator){
                throw error;
            }else{
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
            }

        }
        
    }

    // update the number of images of a dataset, given the number of elements to sum
    async updateCount(datasetId: number, num: number): Promise<Dataset | ConcreteErrorCreator> {
        try {
            const dataset: Dataset | null = await Dataset.findByPk(datasetId);
            if( dataset instanceof Dataset) {
                dataset.countElements += num;
                dataset.save();
                return dataset;
            }
            else throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        } catch (error) {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
    // updates dataset's name
    async updateName(datasetId: number, newName: string): Promise<Dataset | ConcreteErrorCreator> {
        try {
            const dataset: Dataset | null = await Dataset.findByPk(datasetId);
            if( dataset instanceof Dataset) {
                dataset.name = newName;
                dataset.save();
                return dataset;
            } else {
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
            }
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
}