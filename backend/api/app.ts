import express from "express";
import { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import fs from 'fs';
import path from 'path';
require('dotenv').config();
import {createBullBoard} from '@bull-board/api';
import {BullMQAdapter} from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";

import {Queue} from "./queues/Queue";
import {RedisConnection} from "./queues/RedisConnection";


const app = express();
const port = parseInt(process.env.API_PORT || "3000");
const host = "localhost";//process.env.API_HOST ||

const redis_port = parseInt(process.env.REDIS_PORT || "6379");
const redis_host = process.env.REDIS_HOST || 'localhost';
const redisUrl = `redis://${redis_host}:${redis_port}/0`;
const QUEUE_TASK_DOCKER = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';


try {
  // Ottieni la connessione Redis dalla classe singleton
  const connection = RedisConnection.getInstance().redis;

  // Inizializza la coda con la connessione
  const dockerTaskQueue = new Queue(QUEUE_TASK_DOCKER);

  // Definizione del worker
  dockerTaskQueue.process(1, async (job) => {
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
  });

  // Configura Bull Board per gestire le code
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const bullBoard = createBullBoard({
    queues: [new BullMQAdapter(dockerTaskQueue['queue'])], // Passa la proprietà queue della classe Queue
    serverAdapter: serverAdapter
  });

  app.use('/admin/queues', serverAdapter.getRouter());

} catch (err) {
  // Gestisci l'errore
  console.error(err);
}



// Load the OpenAPI JSON file
try {
  const openApiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'));
  app.use('/admin/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}catch (err){
  // todo handle log
  console.error(err);
}


// Define the route for health check
app.get('/check/health', (req: Request, res: Response) => {
  res.json({ system: 'online' });
});

// Start the server
// todo handel log
app.listen(port, () => {
  console.log(`\n\tFor see health of the service: \n\t\t open http://${host}:${port}/check/health \n`);
  console.log(`\tFor the queue UI: \n\t\t open http://${host}:${port}/admin/queues/queue/${QUEUE_TASK_DOCKER} \n`);
  console.log(`\tFor the API doc: \n\t\t open http://${host}:${port}/admin/docs \n\n`);
});
