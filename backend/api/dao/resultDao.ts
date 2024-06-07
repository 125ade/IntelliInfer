import { IDao } from './daoInterface';
import Result from '../models/result';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

export default class ResultDAO implements IDao<Result> {

    constructor() {}
    
    async findAll(): Promise<Result[] | ConcreteErrorCreator> {
          const results = await Result.findAll();
          if( results.length !== 0){
            return results;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }

    async findById(id: number): Promise<Result | ConcreteErrorCreator> {
            const result = await Result.findByPk(id);
            if(!result){
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentResults();
            }
            return result;
    }
    
}