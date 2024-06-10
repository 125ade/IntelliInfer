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

    public async getJobStatus(jobId: string): Promise<string | ConcreteErrorCreator> {
        try {
            const job = await this.queue.getJob(jobId);
            if (!job) {
                throw new ConcreteErrorCreator().createServerError().setFailedCheckStatus();
            }
            return await job.getState();
        } catch (error) {
            if (error instanceof ConcreteErrorCreator) {
                throw error
            }else{
                throw new ConcreteErrorCreator().createServerError().setFailedCheckStatus();
            }
        }
    }

    public async getJobByName(jobName: string) {
        try {
            const jobs = await this.queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
            for (const job of jobs) {
                if (job.data.name === jobName) {
                    return job;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting job by name:', error);
            throw error;
        }
    }



}