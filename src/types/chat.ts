export type Message = {
  question: string
  answer: string
}

export type ChatRole = 'system' | 'assistant' | 'user'

export type ChatType = {
  role: ChatRole
  content: string
}

export type ImageFile = {
  base64Image: string
  mimeType: string
  size: number
  name: string
  width?: number
  height?: number
}
