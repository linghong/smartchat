import AppDataSourceSingleton from '@/src/db/data-source'
import { Chat, ChatMessage, ChatImage } from '@/src/db/entities';


const getAppDataSource = AppDataSourceSingleton.getInstance;

export { getAppDataSource, Chat, ChatMessage, ChatImage }