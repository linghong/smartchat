import AppDataSourceSingleton from '@/src/db/data-source';
import { User, Chat, ChatMessage, ChatFile, AIConfig } from '@/src/db/entities';

const getAppDataSource = AppDataSourceSingleton.getInstance;

export { getAppDataSource, User, Chat, ChatMessage, ChatFile, AIConfig };
