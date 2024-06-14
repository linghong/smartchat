import { OpenAI } from 'openai'
import { encode } from 'gpt-tokenizer'

import { OPENAI_API_KEY } from '@/config/env'
import { Message, ChatType, ChatRole, ImageFile } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

export const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

type ContentForUserMessageProps =
  | {
      type: string
      text: string
    }
  | {
      type: string
      image_url: {
        url: string
      }
    }

export const createEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })

  return embedding.data[0].embedding
}

export const buildChatArray = (
  systemContent: string,
  userMessage: string,
  fetchedText: string,
  chatHistory: Message[],
  maxReturnMessageToken: number,
  contextWindow: number | undefined,
) => {
  // after comparing the token count received from OpenAI, it seems that counting tokens in the way shown below matches better with Open AI's token number.
  const tokenCount = (role: ChatRole, str: string) => {
    return encode(`role ${role} content ${str} `).length
  }
  const tokenUsed =
    tokenCount('system', systemContent) +
    tokenCount('assistant', fetchedText) +
    tokenCount('user', userMessage)
  let tokenLeft = contextWindow ?? 4000 - tokenUsed - maxReturnMessageToken

  let chatArray: ChatType[] = []

  let len = chatHistory.length
  tokenLeft -=
    tokenCount('user', chatHistory[len - 1].question) +
    tokenCount('assistant', chatHistory[len - 1].answer)

  for (let i = chatHistory.length - 1; i >= 0 && tokenLeft > 0; i--) {
    const chat = chatHistory[i]
    chatArray.push({
      role: 'assistant',
      content: chat.answer,
    })
    chatArray.push({
      role: 'user',
      content: chat.question,
    })
    tokenLeft -=
      tokenCount('user', chat.question) + tokenCount('assistant', chat.answer)
  }
  chatArray.reverse()

  return chatArray
}

const contentForUserWithImageMessage = (
  base64ImageSrc: ImageFile[],
  userTextWithFetchedData: string,
) => {
  let contentForUserMessage: ContentForUserMessageProps[] = [
    {
      type: 'text',
      text: userTextWithFetchedData,
    },
  ]
  base64ImageSrc.map(imgSrc => {
    contentForUserMessage.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${imgSrc.base64Image}`,
      },
    })
  })
  return contentForUserMessage
}

export const getOpenAIChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
  base64ImageSrc: ImageFile[] | undefined,
): Promise<string | undefined> => {
  const maxReturnMessageToken = selectedModel.contextWindow ? 4096 : 2000

  const baseSystemContent = `You are an AI assistant, skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. Also, only give answer for the question asked, don't provide text not related to the user's question. 
  
  Always include a concise subject title at the end of each response, enclosed within triple curly braces like this: {{{Subject Title}}}.`

  const htmlTagContent =
    selectedModel.value === 'gpt-4'
      ? 'When presenting information, please ensure to split your responses into paragraphs using <p> HTML tag. If you are providing a list, use the <ul> and <li> tags for unordered lists, <ol> and <li> tags for ordered lists. Highlight the important points using <strong> tag for bold text. Always remember to close any HTML tags that you open.'
      : ''

  const systemContent = baseSystemContent + htmlTagContent

  const chatArray = buildChatArray(
    systemContent,
    userMessage,
    fetchedText,
    chatHistory,
    maxReturnMessageToken,
    selectedModel.contextWindow,
  )

  const userTextWithFetchedData =
    fetchedText !== ''
      ? userMessage +
        '\n' +
        " '''fetchedStart " +
        fetchedText +
        " fetchedEnd'''" +
        '\n' +
        basePrompt
      : userMessage + '\n' + basePrompt

  try {
    const completion = await openaiClient.chat.completions.create({
      model: selectedModel.value,
      temperature: 0,
      max_tokens: maxReturnMessageToken,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      messages: [
        { role: 'system', content: systemContent },
        ...chatArray,
        {
          role: 'user',
          content:
            base64ImageSrc && base64ImageSrc?.length !== 0
              ? contentForUserWithImageMessage(
                  base64ImageSrc,
                  userTextWithFetchedData,
                )
              : userTextWithFetchedData,
        },
      ],
    })

    if (!completion) throw new Error('Chat completion data is undefined.')
    if (!completion.usage) throw new Error('Chat completion data is undefined.')
    if (completion.choices[0].finish_reason !== 'stop')
      console.log(`AI message isn't complete.`)

    let message = completion.choices[0].message?.content ?? ''

    message =
      selectedModel.value === 'gpt-4' ? message : message.replace(/\n/g, '<br>')

    return message
  } catch (error: any) {
    console.error(error.response.data)
    throw error
  }
}
