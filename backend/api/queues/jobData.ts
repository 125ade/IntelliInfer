// this is the data provided and returned
// from and to the dynamic docker creation using redis
export interface JobData {
    userEmail: string;
    callCost: number,
    resultUUID: string,
    model: Object,
    dataset: Object,
    images: Object[],
    results: Object[],
}


export interface JobReturnData {
    userEmail: string;
    callCost: number,
    resultUUID: string,
    images: Object[],
    results: Object[],
}