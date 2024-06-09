import IORedis from 'ioredis';
require('dotenv').config();

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export class RedisConnection {

  private port: number | undefined;
  private host: string | undefined;

  // Connection instance
  private static instance: RedisConnection;
  public redis!: IORedis;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  // Initialize connection
  private static InitializeConnection(): RedisConnection {

    const newInstance: RedisConnection = new RedisConnection();

    newInstance.port = parseInt(process.env.REDIS_PORT || "6379");
    newInstance.host = process.env.REDIS_HOST || 'localhost';

    newInstance.redis = new IORedis({
      host: newInstance.host,
      port: newInstance.port,
      maxRetriesPerRequest: null,
    });

    return newInstance;
  }

  /**
   * static method that controls the access to the singleton instance.
   */
  public static getInstance(): RedisConnection {
    if (this.instance === undefined) this.instance = this.InitializeConnection();

    return this.instance;
  }
}
