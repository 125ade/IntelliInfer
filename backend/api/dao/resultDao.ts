import { IDao } from './daoInterface';
import Result from '../models/result';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';

const initCreationData = {
    start: true,
    finish: false,
    error: null,
}

export default class ResultDAO implements IDao<Result> {

    constructor() {}

    async initCreation(imageID: number, aiID: number, initData: Object = initCreationData, UUID: string ): Promise<Result | ConcreteErrorCreator> {
        try {
            return await Result.create({
                imageId: imageID,
                aiId: aiID,
                data: initData,
                requestId: UUID,
            });
        }catch (error){
            if (error instanceof ConcreteErrorCreator) {
                throw error;
            }else{
                throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
            }
        }
    }

    // async finalizeCreation(Object = initCreationData, UUID: string ): Promise<Result | ConcreteErrorCreator> {
    //     try {
    //         return await Result.update({
    //
    //             requestId: UUID,
    //         });
    //     }catch (error){
    //         if (error instanceof ConcreteErrorCreator) {
    //             throw error;
    //         }else{
    //             throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
    //         }
    //     }
    // }

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

    async findAllByUUID(resoultUUID: string): Promise<Result[] | ConcreteErrorCreator> {

          const results: Result[] = await Result.findAll({
                where: {
                    resoultId: resoultUUID
                }
            });
          if (results.length == 0) {
              throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems()
          }
          return results;

    }
    
}