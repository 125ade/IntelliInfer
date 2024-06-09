// this is the data provided and returned

import Result from "../models/result";
import Image from "../models/image";

// from and to the dynamic docker creation using redis
export interface JobData {
    userEmail: string;
    callCost: number,
    resultUUID: string,
    model: {
        aiId: number,
        architecture: string,
        pathweights: string
    },
    dataset: {
        datasetId: number,
        pathdir: string,
        tags: string[]
    },
    images: Image[],
    results: Result[],
}