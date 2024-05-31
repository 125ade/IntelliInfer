export interface IDao<T> {
    create?(item: any): Promise<T>;
    findById?(id: number): Promise<T | null>;
    findAll?(): Promise<T[] | null>;
    update?(id: number, item2: T): Promise<T | null>;
    delete?(id: number): Promise<boolean>;
    logicallyDelete?(item: T): Promise<Object>;
}