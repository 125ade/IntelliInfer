import express from "express";
import { Request, Response } from 'express';

// Crea un'applicazione Express
const app = express();
const port = 3000;

// Definisce la route per il controllo dello stato
app.get('/check/health', (req: Request, res: Response) => {
  res.json({ system: 'online' });
});



// todo handle log
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});