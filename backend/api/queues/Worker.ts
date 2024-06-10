import Redis from "ioredis";
import { Queue } from "./Queue";
import { RedisConnection } from "./RedisConnection";
import process from "node:process";
import Docker from "dockerode";
import {isJobReturnData, JobData, JobReturnData, JobStatus} from "./jobData";
import {AiArchitecture} from "../static";
import {Repository} from "../repository/repository";
import {ConcreteErrorCreator} from "../factory/ErrorCreator";
import User from "../models/user";
import {Error} from "sequelize";

class InsufficientTokenError extends Error {
  constructor(message = "insufficient token") {
    super(message);
    this.name = "InsufficientTokenError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InsufficientTokenError);
    }
  }
}


const doc_host = process.env.DOCKER_HOST || "unix:///var/run/docker.sock";
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const QUEUE_TASK_DOCKER: string = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';
const test_image_container_name: string = process.env.CONTAINER_IMAGE_NAME || 'intelliinfer-test';
const yolo_image_container_name: string = process.env.CONTAINER_IMAGE_YOLO_NAME || 'intelliinfer-yolo';
const containerNameTest: string = process.env.CONTAINER_TEST_NAME || "working-test";
const containerNameYolo: string = process.env.CONTAINER_YOLO_NAME || "working-yolo";

const extractData = (input: string): string => {
  const regex = /\{\"userEmail\".*$/;
  const match = input.match(regex);
  return match ? match[0] : input;
};

export class TaskQueue {
    private static instance: TaskQueue;
    private repository: Repository;
    private queue: Queue;

    private constructor(concurrencyNum: number = 1) {
        this.queue = new Queue(QUEUE_TASK_DOCKER);
        const connection: Redis = RedisConnection.getInstance().redis;
        this.repository = new Repository();

        this.queue.process(1, async (job) => {
            const jobData : JobData = job.data;
            const jobDataString: string = JSON.stringify(jobData);
            await job.log(`[info] ${job.id}`)
            await job.log(`[info] ${job.name}`)
            const user: User | ConcreteErrorCreator = await this.repository.getUserByEmail(jobData.userEmail)
                   if (user instanceof ConcreteErrorCreator){
                       throw user;
                   }
                   if (!(await this.repository.checkUserToken(user.id, jobData.callCost))){
                       await job.moveToFailed(new InsufficientTokenError,  "ABORTED", true);
                       return;
                   }

            await job.log("[log] inizio work");
            await job.updateProgress(1);

            let containerOptions: {};
            switch (jobData.model.architecture ){
                case AiArchitecture.YOLO:
                    containerOptions = containerOptions = {
                        Image: yolo_image_container_name,
                        Cmd: ['python', 'inferenceYolo.py', jobDataString],
                        Tty: false,
                        name: containerNameYolo,
                        HostConfig: {
                            Binds: ['intelliinfer_media_data:/app/media']
                        }
                    };
                    break;
                case AiArchitecture.TEST:
                default:
                    containerOptions = containerOptions = {
                        Image: test_image_container_name,
                        Cmd: ['python', 'inferenceSimulator.py', jobDataString],
                        Tty: false,
                        name: containerNameTest,
                        HostConfig: {
                            Binds: ['intelliinfer_media_data:/app/media']
                        }
                    };
            }

            try {
                // Creazione del container
                await job.updateProgress(20);
                const container: Docker.Container = await docker.createContainer(containerOptions);
                await job.log(`[log] Container creato: ${container.id}`);



                // Avvio del container
                await job.updateProgress(40);
                await container.start();
                await job.log('[log] Container avviato');

                // Recupero dei log
                const logStream: NodeJS.ReadableStream = await container.logs({
                    follow: true,
                    stdout: true,
                    stderr: true
                });

                await job.updateProgress(60);
                logStream.on('data', (chunk): void => {
                    chunk.toString().split('\n').forEach((line: any): void => {
                        try {
                            const jsonLog = JSON.parse(extractData(line));
                            if (isJobReturnData(jsonLog)){
                                this.repository.updateListResult(jsonLog.results)
                                    .then(async (val: boolean | ConcreteErrorCreator) =>{
                                       if (val instanceof ConcreteErrorCreator){
                                           throw val;
                                       }else{
                                           await this.updateTokenCredit(jsonLog);
                                       }
                                    })
                                    .catch((val: ConcreteErrorCreator | undefined): void =>{
                                        if(val instanceof ConcreteErrorCreator){
                                            throw val;
                                        }
                                    });

                            }

                        } catch (error) {
                            if (error instanceof ConcreteErrorCreator) {
                                throw error
                            }
                        }
                    });
                });

                // Attendere che il container finisca di eseguire
                const data = await container.wait();
                await job.log('[log] Container ha completato il lavoro');
                await job.updateProgress(80);

                // Pulizia del container
                await container.remove();
                await job.log('[log] Container rimosso');
                await job.updateProgress(100);
            } catch (err) {
                await job.log(`[log] Errore: ${err}`);
            }finally {
                await job.log("[log] fine work");
            }
        }, {
            connection,
            concurrency: concurrencyNum,
        });
    }

    private async updateTokenCredit(jsonLog: JobReturnData) {
    try {
        const val = await this.repository.updateListResult(jsonLog.results);
        if (val instanceof ConcreteErrorCreator) {
            throw val;
        } else {
            const utente = await this.repository.getUserByEmail(jsonLog.userEmail);
            if (utente instanceof ConcreteErrorCreator) {
                throw utente;
            }
            await this.repository.updateUserTokenByCost(utente, jsonLog.callCost);
        }
    } catch (val) {
        if (val instanceof ConcreteErrorCreator) {
            throw val;
        }else{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationResult();
        }
    }
}

    public static getInstance(concurrencyNum: number = 1): TaskQueue {
        if (!TaskQueue.instance) {
            TaskQueue.instance = new TaskQueue(concurrencyNum);
        }
        return TaskQueue.instance;
    }

    public async getJobStatus(jobId: string){
        const job = await this.queue.getJobStatus(jobId)

        if (!job) {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
        }
        console.log(job)
    }

    public getQueue(): Queue {
        return this.queue;
    }



}



