import { ConcreteErrorCreator } from "../factory/ErrorCreator";
import DatasetTags from "../models/datasettag";

export interface IDao<T> {
    create?(item: any): Promise<T>;
    findById?(id: number): Promise<T | ConcreteErrorCreator>;
    findAll?(): Promise<T[] | ConcreteErrorCreator>;
    logicallyDelete?(id: number): Promise<Object>;
    updateItem?(id: number, property: any): Promise<T | ConcreteErrorCreator>;
    updateCount?(Id: number, num: number): Promise<T | ConcreteErrorCreator> ;
    findAllByDatasetId?(dataset: number): Promise<string[]>;
}