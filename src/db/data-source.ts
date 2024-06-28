import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Chat, ChatMessage, ChatImage } from '@/src/db/entities';
const options: DataSourceOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Chat, ChatMessage, ChatImage],
  synchronize: true,
  migrations: ['src/db/migration/*.ts'],
  logging: false,
  subscribers: []
};
class AppDataSourceSingleton {
  private static instance: DataSource;
  private constructor() {}
  public static async getInstance(): Promise<DataSource> {
    if (!AppDataSourceSingleton.instance) {
      AppDataSourceSingleton.instance = new DataSource(options);
      await AppDataSourceSingleton.instance.initialize();
    }
    return AppDataSourceSingleton.instance;
  }
}

export default AppDataSourceSingleton
