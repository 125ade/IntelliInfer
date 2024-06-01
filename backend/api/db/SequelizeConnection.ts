import { Sequelize } from 'sequelize';
import Ai from '../models/ai'
import Dataset from '../models/dataset';
import Image from '../models/image';
import Label from '../models/label';
import Result from '../models/result';
import Tag from '../models/tag';
import User from '../models/user';

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export class SequelizeConnection {
  
  // Connection instance
  private static instance: SequelizeConnection;
  public sequelize!: Sequelize;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}
  
  // Initialize connection
  private static InitializeConnection(): SequelizeConnection {
    
    const newInstance = new SequelizeConnection();

    newInstance.sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),  // Convert string to number
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Ai, Dataset, Image , Label, Result, Tag, User, User] // This automatically adds models
    });
    return newInstance;
  }

  /**
   * static method that controls the access to the singleton instance.
   */
  public static getInstance(): SequelizeConnection {
    if (this.instance === undefined) this.instance = this.InitializeConnection();

    return this.instance;
  }
}
