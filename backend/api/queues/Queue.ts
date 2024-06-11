import { Queue as BullQueue,
    Worker as BullWorker,
    QueueOptions,
    WorkerOptions,
    Job } from 'bullmq';
import { RedisConnection } from "./RedisConnection";
import Redis from "ioredis";
import {ConcreteErrorCreator} from "../factory/ErrorCreator";


export class Queue {
    private queue: BullQueue;
    private worker: BullWorker | undefined;

    constructor(queueName: string, options?: QueueOptions) {
        const connection: Redis = RedisConnection.getInstance().redis;
        this.queue = new BullQueue(queueName, { ...options, connection });
    }

    public addJob(id: string, data: any, opts?: any) {
        return this.queue.add(id, data, opts);
    }

    public process(concurrency: number, processor: (job: Job) => Promise<void>, workerOptions?: WorkerOptions) {
        const connection: Redis = RedisConnection.getInstance().redis;
        this.worker = new BullWorker(this.queue.name, processor, { ...workerOptions, connection, concurrency });
    }

    public close() {
        this.queue.close();
        if (this.worker) {
            this.worker.close();
        }
    }

    public async getJob(jobId: string) {
        try {
            return await this.queue.getJob(jobId);
        } catch (error) {
            throw new ConcreteErrorCreator().createServerError().setFailedCheckStatus();
        }
    }


}