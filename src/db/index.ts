import AppDataSourceSingleton from '@/src/db/data-source';
import { User, Chat, ChatMessage, ChatFile } from '@/src/db/entities';

const getAppDataSource = AppDataSourceSingleton.getInstance;

export { getAppDataSource, User, Chat, ChatMessage, ChatFile };
