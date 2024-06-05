import fs from 'fs';
import path from 'path';
import Redis from "ioredis";
require('dotenv').config();
import express, {Express} from "express";
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";
import { setupLogging } from "./middleware/logger.middleware";
import { Queue } from "./queues/Queue";
import { RedisConnection } from "./queues/RedisConnection";
import {SystemRoutes, UserRoutes} from "./routes/index.routes";
import { syncDb } from "./db/dbSync";
import * as process from "node:process";
import {AuthUser, verifyTokenExpiration, verifyTokenSignature, verifyUserRole} from "./middleware/auth.middleware";
import {UserRole} from "./static";
import {handleRouteNotFound} from "./middleware/route.middleware";


// api variable
const port: number = parseInt(process.env.API_PORT || "3000");
const host: string = process.env.API_HOST || "localhost";
// redis definition
const redis_port: number = parseInt(process.env.REDIS_PORT || "6379");
const redis_host: string = process.env.REDIS_HOST || 'localhost';
const redisUrl: string = `redis://${redis_host}:${redis_port}/0`;
// job queue name definition taken from env
const QUEUE_TASK_DOCKER: string = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';


// init express
const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// init log middleware
setupLogging(app)

// sync db
syncDb().then(():void=>{console.log("\t--> SYNC BD DONE")})






// manage job
try {
  // Ottieni la connessione Redis dalla classe singleton
  const connection :Redis = RedisConnection.getInstance().redis;

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
  // todo handle log
  console.error(err);
}



// manage job
try {
  const openApiSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf8'));
  app.use('/admin/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}catch (err){
  // todo handle log
  console.error(err);
}




// Inizializza le rotte
const userRoutes : UserRoutes = new UserRoutes();
const systRoutes: SystemRoutes = new SystemRoutes()
// Usa le rotte definite nella classe UserRoutes
app.use('/api', userRoutes.router);
app.use('/api', systRoutes.router);


// manage health check
app.get('/check/health', (req: Request, res: Response) => {res.json({ system: 'online' });});
// manage 404 route not found
app.use(handleRouteNotFound);

// Start the server
app.listen(port, () => {
    console.log("\t--> SERVER START")
    console.log(`\t--> UI Queue Management http://localhost:${port}/admin/queues/queue/${QUEUE_TASK_DOCKER}`);
    console.log(`\t--> API docs page       http://localhost:${port}/admin/docs `);
});
