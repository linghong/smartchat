import 'reflect-metadata';
import AppDataSourceSingleton from '@/src/db/data-source';
import { User, Chat, ChatMessage, ChatImage } from '@/src/db/entities';

const getAppDataSource = AppDataSourceSingleton.getInstance;

export { getAppDataSource, User, Chat, ChatMessage, ChatImage };
