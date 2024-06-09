import { IDao } from './daoInterface';
import Result from '../models/result';
import { ConcreteErrorCreator } from '../factory/ErrorCreator';
import {FinishResult} from "../queues/jobData";

const initCreationData = {
    start: true,
    finish: false,
    error: null,
}

export default class ResultDAO implements IDao<Result> {

    constructor() {}

    async initCreation(imageID: number, aiID: number, UUID: string ): Promise<Result | ConcreteErrorCreator> {
        try {
            return await Result.create({
                imageId: imageID,
                aiId: aiID,
                data: initCreationData,
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

    async finalizeCreation(finishResult: FinishResult): Promise<number | ConcreteErrorCreator> {
        try {
            if(!("data" in finishResult)) {
                throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
            }
            const x =  await Result.update(
              {
                  data: finishResult.data,
              },
              {
                where: {
                    id: finishResult.id,
                    requestId: finishResult.requestId,
                }
              }
            );
            return Number(x.pop())
        }catch (error){
            if (error instanceof ConcreteErrorCreator) {
                throw error;
            }else{
                throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
            }
        }
    }

    async findAll(): Promise<Result[] | ConcreteErrorCreator> {
          const results: Result[] = await Result.findAll();
          if( results.length !== 0){
            return results;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }

    async findById(id: number): Promise<Result | ConcreteErrorCreator> {
            const result: Result | null = await Result.findByPk(id);
            if(!(result instanceof Result)){
                throw new ConcreteErrorCreator().createNotFoundError().setAbsentResults();
            }
            return result;
    }

    async findOneByResultId(uuid: string): Promise<boolean> {
        const existingRecord: Result | null = await Result.findOne({
            where: {
                requestId: uuid
            }
        });
        if (existingRecord instanceof Result) {
            return true;
        }else{
            return false
        }
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