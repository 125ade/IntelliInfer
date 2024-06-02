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
    
    
    async findAll(): Promise<Ai[] | null> {
        try {
          const models = await Ai.findAll();
          return models;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    
   

    // da fare un update che aggiorna i pesi

    // DA AGGIORNARE CON LA FACTORY PER ERRORE
    async findById(id: number): Promise<Ai | null> {
        return await Ai.findByPk(id);
    }
    

    async delete(id: number): Promise<boolean> {
        const ai = await Ai.findByPk(id);
        if (ai) {
            await ai.destroy();
            return true;
        }
        return false;
    }
    
}