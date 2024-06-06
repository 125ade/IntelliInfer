import { IDao } from './daoInterface';
import Dataset from '../models/dataset';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

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
    async findAll(): Promise<Dataset[] | null> {
        try {
          const datasets: Dataset[] = await Dataset.findAll({
            where: {
              isDeleted: false
            }
          });
          return datasets;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
    // returns all datasets associated to a specific userId on database
    async findAllByUserId(userId: number): Promise<Dataset[] | ConcreteErrorCreator> {
        try {
            return await Dataset.findAll({
                where: {
                    userId: userId
                }
            });
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
   
    // find a dataset by datasetId
    // NB we have to handle errors
    async findById(datasetId: number): Promise<Dataset | null> {
        try {
            return await Dataset.findOne({
                where: {
                    id: datasetId,
                    isDeleted: false
                }
            });
        } catch (error) {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    

    // logically deletes a dataset (sets isDeleted to true)
    // da fare gestione migliore degli errori, vorrei gestire anche la possibilità che il dataset con l'id specificato non sia presente nel db
    async logicallyDelete(datasetId: number): Promise<Object> {
        try{
            return await Dataset.update(
                { isDeleted: true },
                {
                  where: { id: datasetId },
                  returning: true
                }
            );
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbstentDataset();
        }
        
    }
    
}