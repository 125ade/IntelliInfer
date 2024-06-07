import Redis from "ioredis";
import { Queue } from "./Queue";
import { RedisConnection } from "./RedisConnection";
import process from "node:process";

const QUEUE_TASK_DOCKER: string = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';

export class TaskQueue {
    private static instance: TaskQueue;
    private queue: Queue;

    private constructor(concurrencyNum: number = 1) {
        this.queue = new Queue(QUEUE_TASK_DOCKER);
        const connection: Redis = RedisConnection.getInstance().redis;

        this.queue.process(1, async (job) => {
            await job.log("[log] inizio work");
            await job.updateProgress(1);

            await job.updateProgress(40);

            try {
                await job.updateProgress(50);
            } catch (err) {
                await job.log(`[log] Errore: ${err}`);
            }

            await job.updateProgress(100);
            await job.log("[log] fine work");
        }, {
            connection,
            concurrency: concurrencyNum,
        });
    }

    public static getInstance(concurrencyNum: number = 1): TaskQueue {
        if (!TaskQueue.instance) {
            TaskQueue.instance = new TaskQueue(concurrencyNum);
        }
        return TaskQueue.instance;
    }

    public getQueue() {
        return this.queue;
    }
}



