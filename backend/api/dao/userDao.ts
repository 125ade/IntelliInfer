import { IDao } from './daoInterface';
import User from '../models/user';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class UserDao implements IDao<User> {

    constructor() {}
    
    // it creates a new User or throw an error if the creation operation failed
    async create(userJson: any): Promise<User> {
        try{
            const data: User = await User.create(userJson);
            return data;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // to delete if not used
    async findById(id: number): Promise<User | ConcreteErrorCreator> {
        const user: User | null = await User.findByPk(id);
        if(!user){
            throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
        }
        return user;
    }
    
    // finds a user given his email
    async findByEmail(email: string): Promise<User | ConcreteErrorCreator> {
            const user: User | null = await User.findOne({ where: { email } });
            if (!user) {
                throw new ConcreteErrorCreator().createNotFoundError().setNoUser();
            } else {
                return user;
            }
    }
}

