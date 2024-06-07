import {IDao} from './daoInterface';
import Result from '../models/result';
import {ConcreteErrorCreator} from '../factory/ErrorCreator';

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
    
    // potrebbe servire all'utente visualizzare tutti i risultati ottenuti dalle inferenze precedenti??
    async findAll(): Promise<Result[] | null> {
        try {
          const results = await Result.findAll();
          return results;
        } catch {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
    }

    async findAllByUUID(resoultUUID: string): Promise<Result[] | ConcreteErrorCreator> {
        try {
          const results: Result[] = await Result.findAll({
                where: {
                    resoultId: resoultUUID
                }
            });
          if (results.length == 0) {
              throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems()
          }
          return results;
        } catch (error) {
            if(error instanceof ConcreteErrorCreator) {
                throw error;
            }else{
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
            }
        }
    }



    async findById(id: number): Promise<Result | ConcreteErrorCreator> {
            const result = await Result.findByPk(id);
            if(!result){
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentResults();
            }
            return result;
    }
    
    // se vogliamo introdurre l'opzione di scegliere se rendere un dataset pubblico o privato, e l'utende sceglie di rendere il proprio dataset
    // privato, si suppone che una volta visualizzati i risultati dell'inferenza sul proprio dataset questi siano inutili nel db, quindi è tenuto
    // a cancellarli
    async delete(id: number): Promise<boolean> {
        const result = await Result.findByPk(id);
        if (result) {
            await result.destroy();
            return true;
        }
        else{
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentResults();
        }
    }
    
}