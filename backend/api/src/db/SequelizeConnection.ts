import { Sequelize } from 'sequelize';

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export class SequelizeConnection {
  
  // Connection instance
  private static instance: Sequelize;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    // Initialize connection
    SequelizeConnection.instance = new Sequelize({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),  // Convert string to number
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB
    });

    // Test connection
    SequelizeConnection.instance.authenticate().then(() => {
      console.log('Sequelize connected');
    }).catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  }

  /**
   * The static method that controls the access to the singleton instance.
   */
  public static getInstance(): Sequelize {
    if (!SequelizeConnection.instance) {
      new SequelizeConnection();
    }
    return SequelizeConnection.instance;
  }
}
