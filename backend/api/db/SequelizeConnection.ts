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

    const user: string = process.env.POSTGRES_USER || "myuser";
    const password: string = process.env.POSTGRES_PASSWORD || "mypassword";
    const database: string = process.env.POSTGRES_DB || "db_inference";

    newInstance.sequelize = new Sequelize(
        database,
        user,
        password,
        {
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'database',
      port: Number(process.env.POSTGRES_PORT || '5432'),
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
