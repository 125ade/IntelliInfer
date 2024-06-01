import { IDao } from './daoInterface';
import User from '../models/user';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class UserDAO implements IDao<User> {

    constructor() {}
    
    // it creates a new User or throw an error if the creation operation failed
    async create(userJson: any): Promise<User> {
        try{
            const data = await User.create(userJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // to delete if not used
    async findById(id: number): Promise<User | null> {
        return await User.findByPk(id);
    }
    
    // I suppose the admin could create and delete users (??)
    async delete(id: number): Promise<boolean> {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            return true;
        }
        return false;
    }
}

