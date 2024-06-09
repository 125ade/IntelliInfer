import { IDao } from './daoInterface';
import Ai from '../models/ai';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class AiDao implements IDao<Ai> {

    constructor() {}
    
    // creates an ai model given a series of metadata
    async create(aiJson: any): Promise<Ai> {
        try{
            const ai = await Ai.create(aiJson);
            return ai;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // returns the list of all ai models on db
    async findAll(): Promise<Ai[] | ConcreteErrorCreator> {
          const models: Ai[] = await Ai.findAll();
          if( models.length !== 0){
            return models;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }
    
   // finds a specific ai model given its id
    async findById(id: number): Promise<Ai | ConcreteErrorCreator> {
            const model = await Ai.findByPk(id);
            if(!model){
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
            }
            return model;
    }
    
    // updates weights path of an ai specified by its id
    async updateItem(id: number, weights: any): Promise<Ai | ConcreteErrorCreator> {
        const model = await Ai.findByPk(id);
            if(!model){
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
            }
            model.pathweights = weights;
            model.save();
            return model;
    }
    
}