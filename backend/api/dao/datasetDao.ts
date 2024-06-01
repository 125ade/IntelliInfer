import { IDao } from './daoInterface';
import Dataset from '../models/dataset';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class DatasetDao implements IDao<Dataset> {

    constructor() {}
    
    async create(datasetJson: any): Promise<Dataset> {
        try{
            const dataset = await Dataset.create(datasetJson);
            return dataset;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    
    async findAll(): Promise<Dataset[] | null> {
        try {
          const datasets = await Dataset.findAll();
          return datasets;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
   

    async update?(Id: number, dataset: Dataset): Promise<Dataset | null> {
        try {
          
          const existingDataset = await Dataset.findByPk(Id);
          if (!existingDataset) {
            return null;
          } 
          await existingDataset.update(dataset);
          return existingDataset;
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedUpdatingItem();
        }
    }

    // DA AGGIORNARE CON LA FACTORY PER ERRORE
    async findById(id: number): Promise<Dataset | null> {
        return await Dataset.findByPk(id);
    }
    

    async delete(id: number): Promise<boolean> {
        const dataset = await Dataset.findByPk(id);
        if (dataset) {
            await dataset.destroy();
            return true;
        }
        return false;
    }

    // logically deletes a dataset
    async logicallyDelete(dataset: Dataset): Promise<Object> {
        await dataset.set({ isDeleted: true }).save();
        return { deletedDataset: dataset };
    }
    
}