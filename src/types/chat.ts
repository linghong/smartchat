export type Message = {
  question: string,
  answer: string
}

export type ChatRole = 'system' | 'assistant' | 'user';

export type ChatType = {
  role: ChatRole,
  content: string
}