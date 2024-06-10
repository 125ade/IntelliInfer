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

export interface BoundingBox {
    class_id: number,
    confidence: number,
    x_center: number,
    y_center: number,
    width: number,
    height: number
}

export interface DataResultInterface {
    error: undefined,
    start: boolean,
    finish: boolean,
    box?: BoundingBox[]
}


export interface FinishResult {
    id: number,
    imageId: number,
    aiId: number,
    data: {
        error: undefined,
        start: boolean,
        finish: boolean,
        box?: BoundingBox[]
    },
    requestId: string,
    updated_at: string,
    created_at: string
}

export interface JobReturnData {
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
    results: FinishResult[],
}

const isBoundingBox = (data: any): data is BoundingBox => {
    return (
        typeof data.class_id === 'number' &&
        typeof data.confidence === 'number' &&
        typeof data.x_center === 'number' &&
        typeof data.y_center === 'number' &&
        typeof data.width === 'number' &&
        typeof data.height === 'number'
    );
};

const isFinishResult = (data: any): data is FinishResult => {
    return (
        typeof data.id === 'number' &&
        typeof data.imageId === 'number' &&
        typeof data.aiId === 'number' &&
        typeof data.data === 'object' &&
        data.data !== null &&
        typeof data.data.start === 'boolean' &&
        typeof data.data.finish === 'boolean' &&
        (data.data.box === undefined ||
            (Array.isArray(data.data.box) && data.data.box.every(isBoundingBox))) &&
        typeof data.requestId === 'string' &&
        typeof data.updated_at === 'string' &&
        typeof data.created_at === 'string'
    );
};

export const isJobReturnData = (data: any): data is JobReturnData => {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.userEmail === 'string' &&
        typeof data.callCost === 'number' &&
        typeof data.resultUUID === 'string' &&
        typeof data.model === 'object' &&
        data.model !== null &&
        typeof data.model.aiId === 'number' &&
        typeof data.model.architecture === 'string' &&
        typeof data.model.pathweights === 'string' &&
        typeof data.dataset === 'object' &&
        data.dataset !== null &&
        typeof data.dataset.datasetId === 'number' &&
        typeof data.dataset.pathdir === 'string' &&
        Array.isArray(data.dataset.tags) &&
        data.dataset.tags.every((tag: any) => typeof tag === 'string') &&
        Array.isArray(data.images) &&
        // Assume `isImage` is a function to validate Image type
        data.images.every((image: any) => typeof image === 'object') &&
        Array.isArray(data.results) &&
        data.results.every(isFinishResult)
    );
};


export type JobStatus = 'completed' | 'failed' | 'delayed' | 'active' | 'waiting' | 'stuck' | 'aborted';
