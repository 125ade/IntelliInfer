import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { Express} from 'express'; // Request, Response, NextFunction,

const logDirectory = path.resolve(__dirname, '../../logs');

// Assicurati che la directory dei log esista
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Configura i flussi di scrittura per i log dei file e della console
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'access.log'), { flags: 'a' });

const getLogFormat = () => {
  const env = process.env.NODE_ENV || 'development';
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
          write: (message:string) => {
            accessLogStream.write(message);
            process.stdout.write(message);
          },
        },
      });
  }
};

export const setupLogging = (app: Express) => {
  app.use(getMorganMiddleware());
};
