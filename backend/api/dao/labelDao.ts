import { IDao } from './daoInterface';
import Label from '../models/label';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class LabelDAO implements IDao<Label> {

    constructor() {}
    
    async create(labelJson: any): Promise<Label> {
        try{
            const data = await Label.create(labelJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // non metto le opzioni di update e findbyId perchè le labels ci interessano meno rispetto alle immagini, in quanto
    // per ora il nostro obbiettivo è fare solo inferenza

    
    // delete lo metto perchè quando viene eliminata un'immagine è giusto eliminare anche la label associata
    async delete(id: number): Promise<boolean> {
        const label = await Label.findByPk(id);
        if (label) {
            await label.destroy();
            return true;
        }
        return false;
    }
    
}