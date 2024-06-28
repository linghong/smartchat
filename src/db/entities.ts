import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne
} from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  title!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @OneToMany(() => ChatMessage, (message: ChatMessage) => message.chat)
  messages!: ChatMessage[];

  @OneToMany(() => ChatImage, (image: ChatImage) => image.id)
  images!: ChatImage[];

  constructor(title: string, metadata?: { [key: string]: any }) {
    this.title = title;
    this.metadata = metadata;
  }
}

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  question: string;

  @Column('text')
  answer: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column('simple-json', { nullable: true })
  metadata?: { [key: string]: any };

  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  chat!: Chat;

  @OneToMany(() => ChatImage, (image: ChatImage) => image.message)
  images!: ChatImage[];

  constructor(
    question: string,
    answer: string,
    chat: Chat,
    metadata?: { [key: string]: any }
  ) {
    this.question = question;
    this.answer = answer;
    this.chat = chat;
    this.metadata = metadata;
  }
}

@Entity()
export class ChatImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  url!: string;

  @ManyToOne(() => ChatMessage, (message: ChatMessage) => message.images)
  message!: ChatMessage;

  constructor(url: string, message: ChatMessage) {
    this.url = url;
    this.message = message;
  }
}
