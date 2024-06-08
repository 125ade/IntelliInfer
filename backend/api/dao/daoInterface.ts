import { ConcreteErrorCreator } from "../factory/ErrorCreator";

export interface IDao<T> {
    create?(item: any): Promise<T | ConcreteErrorCreator>;
    findById?(id: number): Promise<T | ConcreteErrorCreator>;
    findAll?(): Promise<T[] | ConcreteErrorCreator>;
    logicallyDelete?(id: number): Promise<object>;
    updateItem?(id: number, property: any): Promise<T | ConcreteErrorCreator>;
    updateCount?(Id: number, num: number): Promise<T | ConcreteErrorCreator> ;
    findAllByDatasetId?(dataset: number): Promise<string[]>;
}