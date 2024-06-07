import { IDao } from './daoInterface';
import Image from '../models/image';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class ImageDao implements IDao<Image> {

    constructor() {}
    
    async create(imageJson: any): Promise<Image> {
        try{
            const data = await Image.create(imageJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }

    async findById(id: number): Promise<Image | ConcreteErrorCreator> {
        const image = await Image.findByPk(id);
        if(!image){
            throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
        }
        return image;
    }
    
}