import { IDao } from './daoInterface';
import Ai from '../models/ai';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class AiDao implements IDao<Ai> {

    constructor() {}
    
    async create(aiJson: any): Promise<Ai> {
        try{
            const ai = await Ai.create(aiJson);
            return ai;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    
    async findAll(): Promise<Ai[] | ConcreteErrorCreator> {
          const models = await Ai.findAll();
          if( models.length !== 0){
            return models;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }
    
   
    async findById(id: number): Promise<Ai | ConcreteErrorCreator> {
            const model = await Ai.findByPk(id);
            if(!model){
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
            }
            return model;
    }

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