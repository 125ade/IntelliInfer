import fs from 'fs';
import path from 'path';
import Redis from "ioredis";
require('dotenv').config();
import express from "express";
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";
import { setupLogging } from "./middleware/logger.middleware";
import { Queue } from "./queues/Queue";
import { RedisConnection } from "./queues/RedisConnection";
import { UserRoutes } from "./routes/index.routes";
import { syncDb } from "./db/dbSync";
import * as process from "node:process";
import AdminRoutes from './routes/admin.routes';



// api variable
const port = parseInt(process.env.API_PORT || "3000");
const host = process.env.API_HOST || "localhost";
// redis definition
const redis_port = parseInt(process.env.REDIS_PORT || "6379");
const redis_host = process.env.REDIS_HOST || 'localhost';
const redisUrl = `redis://${redis_host}:${redis_port}/0`;
// job queue name definition taken from env
const QUEUE_TASK_DOCKER = process.env.DOKER_QUEUE_NAME || 'dockerTaskQueue';


// init express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init log middleware
setupLogging(app)

// sync db                             --> SERVER START
syncDb().then(():void=>{console.log("\t--> SYNC BD DONE")})
// ).then(() => {
//      console.log("Database connected");
//   }
// ).catch(err => {
//   console.error("Failed to sync database:", err);
// });

app.set('view engine', 'ejs');

app.get('/', (req, res) => { 
    res.render('main');
});


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


// manage health check
app.get('/check/health', (req: Request, res: Response) => {
  res.json({ system: 'online' });
});

// Inizializza le rotte
const userRoutes = new UserRoutes();
const adminRoutes = new AdminRoutes();

// Usa le rotte definite nella classe UserRoutes
app.use('/api', userRoutes.router);
app.use('/admin', adminRoutes.router);

// Start the server
// todo handel log
app.listen(port, () => {
  if(process.env.NODE_ENV !== 'production') {
    console.log(`\n\tFor see health of the service: \n\t\t open http://${host}:${port}/check/health \n`);
    console.log(`\tFor the queue UI: \n\t\t open http://${host}:${port}/admin/queues/queue/${QUEUE_TASK_DOCKER} \n`);
    console.log(`\tFor the API doc: \n\t\t open http://${host}:${port}/admin/docs \n\n`);
  }else{
    console.log("\t--> SERVER START")
    console.log(`\t--> UI Queue Management http://${host}:${port}/admin/queues/queue/${QUEUE_TASK_DOCKER}`);
    console.log(`\t--> API docs page       http://${host}:${port}/admin/docs `);
  }
});
