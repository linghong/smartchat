import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';

@Entity('users') // Explicitly name the table
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  username!: string;

  @OneToMany(() => Chat, (chat: Chat) => chat.userId)
  chats!: Chat[];
}

@Entity('chats') // Explicitly name the table
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: false })
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @Column('int')
  userId!: number;

  @OneToMany(() => ChatMessage, (message: ChatMessage) => message.chatId)
  messages!: ChatMessage[];
}

@Entity('chat_messages') // Explicitly name the table
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  userMessage!: string;

  @Column('text')
  aiMessage!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @Column('int')
  chatId!: number;

  @OneToMany(() => ChatImage, (image: ChatImage) => image.messageId)
  images!: ChatImage[];
}

@Entity('chat_images') // Explicitly name the table
export class ChatImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  url!: string;

  @Column('int')
  messageId!: number;
}
