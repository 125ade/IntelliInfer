// this is the data provided and returned
// from and to the dynamic docker creation using redis
export interface JobData {
    userEmail: string;
    callCost: number,
    resultUUID: string,
    images: Object[],
    result: Object[],
}


export interface JobReturnData {
    userEmail: string;
    callCost: number,
    resultUUID: string,
    images: Object[],
    result: Object[],
}