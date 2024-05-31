import { IDao } from './daoInterface';
import Image from '../models/image';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class ImageDAO implements IDao<Image> {

    constructor() {}
    
    async create(imageJson: any): Promise<Image> {
        try{
            const data = await Image.create(imageJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // si può valutare l'idea di far visualizzare all'utente tutte le immagini nel db affinchè ne possa scegliere una da mandare in inferenza
    async findAll(): Promise<Image[] | null> {
        try {
          const images = await Image.findAll();
          return images;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }

    // to delete if not used
    async findById(id: number): Promise<Image | null> {
        return await Image.findByPk(id);
    }
    
    // non metto l'update perchè non vedo il senso di modificare un'immagine 

    // da usare nel repository all'interno di un'altra funzione che elimini immagini in uno specifico dataset
    async delete(id: number): Promise<boolean> {
        const image = await Image.findByPk(id);
        if (image) {
            await image.destroy();
            return true;
        }
        return false;
    }
    
}