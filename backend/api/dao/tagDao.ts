import { IDao } from './daoInterface';
import Tag from '../models/tag';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class TagDAO implements IDao<Tag> {

    constructor() {}
    
    // it creates a new Tag or throw an error if the creation operation failed
    async create(tagJson: any): Promise<Tag> {
        try{
            const [data, created] = await Tag.findOrCreate({
                where: { name: tagJson.name },
            });
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
}