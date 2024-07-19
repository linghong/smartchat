import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User, Chat, ChatMessage, ChatImage } from '@/src/db/entities';

const options: DataSourceOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Chat, ChatMessage, ChatImage],
  synchronize: true, //change to false on production
  migrations: ['src/db/migration/*.ts'],
  logging: false, //change to true or ['query', 'error', 'schema'] for debug purpose
  subscribers: []
};
class AppDataSourceSingleton {
  private static instance: DataSource;

  private constructor() {}

  public static async getInstance(): Promise<DataSource | null> {
    if (!AppDataSourceSingleton.instance) {
      AppDataSourceSingleton.instance = new DataSource(options);
      try {
        await AppDataSourceSingleton.instance.initialize();
        return AppDataSourceSingleton.instance;
      } catch (e) {
        console.error('Error during data source initialization', e);
        return null;
      }
    }
    return AppDataSourceSingleton.instance;
  }
}

export default AppDataSourceSingleton;
