import {IDao} from './daoInterface';
import Dataset from '../models/dataset';
import {ConcreteErrorCreator} from '../factory/ErrorCreator';
import {SuccessResponse} from "../utils/utils";
import {ErrorCode} from "../factory/ErrorCode";

export default class DatasetDao implements IDao<Dataset> {

    constructor() {}
    
    // creates a dataset with informations given by datasetJson
    async create(datasetJson: any): Promise<Dataset> {
        try{
            const dataset = await Dataset.create(datasetJson);
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
        const datasets = await Dataset.findAll({
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
    
   
    // find a dataset by datasetId
    async findById(datasetId: number): Promise<Dataset | ConcreteErrorCreator> {
            const dataset = await Dataset.findOne({
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
    // da fare gestione migliore degli errori, vorrei gestire anche la possibilità che il dataset con l'id specificato non sia presente nel db
    async logicallyDelete(datasetId: number): Promise<ErrorCode | SuccessResponse>{
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
            return {
                success: true,
                message: "deleted successfully",
                obj: affectedRows[0]
            };
        } catch {
            return new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
        }
        
    }

    // find a dataset by datasetId
    // NB we have to handle errors
    async updateCount(datasetId: number, num: number): Promise<Dataset | ConcreteErrorCreator> {
        try {
            const dataset = await Dataset.findByPk(datasetId);
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
    
}