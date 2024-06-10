import express, {Express} from "express";
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";
import { setupLogging } from "./middleware/logger.middleware";
import {SystemRoutes, UserRoutes, AdminRoutes} from "./routes/index.routes";
import { syncDb } from "./db/dbSync";
import * as process from "node:process";
import {handleRouteNotFound} from "./middleware/route.middleware";
import {TaskQueue} from "./queues/Worker";


require('dotenv').config();

// api variable
const port: number = parseInt(process.env.API_PORT || "3000");

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

const taskQueue = TaskQueue.getInstance().getQueue();
const serverAdapter: ExpressAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
    queues: [new BullMQAdapter(taskQueue['queue'])],
    serverAdapter: serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());


// Routes Inizialization
const userRoutes: UserRoutes = new UserRoutes();
const systRoutes: SystemRoutes = new SystemRoutes()
const adminRoutes: AdminRoutes = new AdminRoutes();

app.use('/api', userRoutes.router);
app.use('/admin', adminRoutes.router);
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
