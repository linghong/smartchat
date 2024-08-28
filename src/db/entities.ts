import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';

import type { FileData } from '@/src/types/chat';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true
  })
  username!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  password!: string;

  @OneToMany(() => Chat, chat => chat.user)
  chats!: Chat[];
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: false })
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @ManyToOne(() => User, user => user.chats)
  user!: User;

  @Column('int')
  userId!: number;

  @OneToMany(() => ChatMessage, message => message.chat)
  messages!: ChatMessage[];
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  userMessage!: string;

  @Column('text')
  aiMessage!: string;

  @Column('text')
  model!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @ManyToOne(() => Chat, chat => chat.messages)
  chat!: Chat;

  @Column('int')
  chatId!: number;

  @OneToMany(() => ChatFile, file => file.chatMessage)
  files!: ChatFile[];
}

@Entity('chat_files')
export class ChatFile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('simple-json', { nullable: true })
  fileData?: FileData;

  @Column('varchar')
  type!: string;

  @ManyToOne(() => ChatMessage, message => message.files)
  chatMessage!: ChatMessage;

  @Column('int')
  messageId!: number;
}
