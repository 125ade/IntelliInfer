import { IDao } from './daoInterface';
import Tag from '../models/tag';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class TagDAO implements IDao<Tag> {

    constructor() {}
    
    // it creates a new Tag or throw an error if the creation operation failed
    async create(tagJson: any): Promise<Tag> {
        try{
            const data = await Tag.create(tagJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // ho supposto che l'utente abbia la possibilità di visualizzare i tags per cercare quali classi di oggetti 
    // cercare attraverso l'inferenza.
    // il servizio potrebbe essere: visualizzo le classi disponibili -> scelgo la classe -> visualizzo i datasets dove è presente quella classe
    // (cioè i datasets con stesso tag) -> scelgo il dataset da mandare in inferenza
    async findAll(): Promise<Tag[] | null> {
        try {
          const tags = await Tag.findAll();
          return tags;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }
    

    // da implementare nel repository una funzione che dato l'id di un dataset ne aggiorna il tag
    async update(Id: number, tag: Tag): Promise<Tag | null> {
        try {
          const existingTag = await Tag.findByPk(Id)
          if (!existingTag) {
            return null;
          } 
          await existingTag.update(tag);
          return existingTag;
        } catch {
            throw new ConcreteErrorCreator().createServerError().setFailedUpdatingItem();
        }
    }
    

    
    // da implementare nella repository una funzione che prende l'id del dataset che deve essere eliminato, da questo risale al tag
    // e se il tag del dataset in questione era l'unico del database allora viene eliminato anche il tag
    async delete(id: number): Promise<boolean> {
        const user = await Tag.findByPk(id);
        if (user) {
            await user.destroy();
            return true;
        }
        return false;
    }
    
}