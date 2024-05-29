import User from '../models/user'
import Image from '../models/image'
import Ai from '../models/ai'
import Dataset from '../models/dataset'
import Tag from '../models/tag'


export interface IRepository {
    findAllModels(): Promise<Ai[]>;
    findAllDatasets(): Promise<Dataset[]>;
    findModelById(id: number): Promise<Ai | null>;
    findDatasetById(id: number): Promise<Dataset | null>;
    updateDataset(id: number, datasetData: Partial<Dataset>): Promise<void>;
    deleteDataset(dataset: Dataset): Promise<Object>;
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    createDataset(datasetJson: any): Promise<Object>;
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
}
    


