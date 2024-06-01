import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { Express, Request, Response, NextFunction } from 'express';
import * as rfs from 'rotating-file-stream';

require('dotenv').config();

const logDirectory :string = path.resolve(process.env.LOG_PATH || '/app/logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const accessLogDirectory :string = path.join(logDirectory, process.env.LOG_ACCESS_DIR || 'access');
fs.existsSync(accessLogDirectory) || fs.mkdirSync(accessLogDirectory);

const errorLogDirectory :string = path.join(logDirectory, process.env.LOG_ERRORS_DIR || 'errors');
fs.existsSync(errorLogDirectory) || fs.mkdirSync(errorLogDirectory);


// Create a rotating write stream for access logs
const accessLogStream :rfs.RotatingFileStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: accessLogDirectory,
});

// Create a rotating write stream for error logs
const errorLogStream :rfs.RotatingFileStream = rfs.createStream('error.log', {
  interval: '1d', // rotate daily
  path: errorLogDirectory,
});

const getLogFormat = () => {
  const env :string = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'combined' : 'dev';
};

const getMorganMiddleware = () => {
  const logOutput = process.env.LOG_OUTPUT || 'both';
  // todo mettere in doc -> 'console', 'file', 'both'
  const logFormat = getLogFormat();

  switch (logOutput) {
    case 'console':
      return morgan(logFormat);
    case 'file':
      return morgan(logFormat, { stream: accessLogStream });
    case 'both':
    default:
      return morgan(logFormat, {
        stream: {
          write: (message: string) => {
            accessLogStream.write(message);
            process.stdout.write(message);
          },
        },
      });
  }
};


const setupLogging = (app: Express) => {
  app.use(getMorganMiddleware());

  // Error logging middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const errorLog = `${new Date().toISOString()} - ${req.method} ${req.url} - ${err.stack || err.message}\n`;
    errorLogStream.write(errorLog);
    next(err);
  });
};

export { setupLogging };
