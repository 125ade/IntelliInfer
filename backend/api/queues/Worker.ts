import Redis from "ioredis";
import { Queue } from "./Queue";
import { RedisConnection } from "./RedisConnection";
import process from "node:process";
import Docker from "dockerode";
const doc_host = process.env.DOCKER_HOST || "unix:///var/run/docker.sock";
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const QUEUE_TASK_DOCKER: string = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';
const test_image_container_name: string = process.env.CONTAINER_IMAGE_NAME || 'intelliinfer-test';

export class TaskQueue {
    private static instance: TaskQueue;
    private queue: Queue;

    private constructor(concurrencyNum: number = 1) {
        this.queue = new Queue(QUEUE_TASK_DOCKER);
        const connection: Redis = RedisConnection.getInstance().redis;

        this.queue.process(1, async (job) => {
            const jobData = job.data;
            const jobDataString: string = JSON.stringify(jobData);
            const containerName: string = "working-test";

            docker.listContainers((err, containers) => {
                if (err) {
                    job.log(`[log] ${err}`);
                } else {
                    if (containers) {
                        containers.forEach((data) => {
                            job.log(`[log] immagine: ${data.Image}`);
                        });

                        const testContainer = containers.find((container) => {
                            return container.Names.includes(`/${containerName}`);
                        });

                        if (testContainer && testContainer.State === "exited") {
                            job.log(`[log] Il container ${containerName} è uscito. Riavvio in corso...`);

                            // Riavvio del container
                            docker.getContainer(testContainer.Id).start();
                            job.log(`[log] Container ${containerName} riavviato.`);
                        }
                    } else {
                        job.log(`[log] errore containers: ${containers}`);
                    }
                }
            });

            await job.log("[log] inizio work");
            await job.updateProgress(1);

            // todo selezionare in base all'architettura
            const containerOptions = {
                Image: test_image_container_name,
                Cmd: ['python', 'inferenceSimulator.py', jobDataString],
                Tty: false,
                name: containerName,
            };

            try {
                // Creazione del container
                await job.updateProgress(20);
                const container = await docker.createContainer(containerOptions);
                await job.log(`[log] Container creato: ${container.id}`);

                // Avvio del container
                await job.updateProgress(40);
                await container.start();
                await job.log('[log] Container avviato');

                // Recupero dei log
                const logStream = await container.logs({
                    follow: true,
                    stdout: true,
                    stderr: true
                });

                await job.updateProgress(60);
                logStream.on('data', (chunk) => {
                    chunk.toString().split('\n').forEach((line:any) => {
                        job.log(`[log] ${line}`);
                    });
                });

                // Attendere che il container finisca di eseguire
                const data = await container.wait();
                await job.log(`[log] Container terminato con stato: ${data.StatusCode}`);
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



