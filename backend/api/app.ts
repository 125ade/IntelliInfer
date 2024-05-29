import express from "express";
import { Request, Response } from 'express';
import swaggerUi from "swagger-ui-express";
import fs from 'fs';
import path from 'path';
require('dotenv').config();
// import {createBullBoard} from '@bull-board/api';
// import {BullMQAdapter} from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from "@bull-board/express";

// Create an Express application
const app = express();
const port = process.env.API_PORT || 3000;
const host = process.env.API_HOST || "localhost";

try {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  app.use('/admin/queues', serverAdapter.getRouter());
}catch (err){
  // todo handle log
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
  console.log('------------------------------------------------------\n|\n|\n|');
  console.log(`| For add job, open http://${host}:${port}/check/health`);
  console.log(`| For the UI, open http://${host}:${port}/admin/queues`);
  console.log(`| For API documentation, open http://${host}:${port}/admin/docs`);
  console.log('|\n|\n|\n|------------------------------------------------------');
});
