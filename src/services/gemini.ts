import { GoogleGenerativeAI, Part } from "@google/generative-ai"

import { Message } from '@/src/types/chat'
import { OptionType } from '@/src/types/common'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if(!GEMINI_API_KEY) throw new Error('Missing Google Gemini API key')

const getCurrentUserParts = async (imageSrc: string[], userMessage: string) => {
  if(imageSrc.length === 0) return  userMessage
    let tempParts : string | (string | Part)[] = [userMessage]

  imageSrc.forEach((image:string) => {

    return tempParts.push({
      inlineData: {
        data: image, // Remove the base64 prefix
        mimeType: "image/png", // Adjust if your images have a different MIME type
      }
    })
  })

  return tempParts
}

const buildChatArray = (chatHistory: Message[]) => {
  const len = chatHistory.length
  
  // Gemini chatHistory starts with user
  let chatArray = [{
    role:'user',
    parts: [{text: chatHistory[0].question}]
  }]

  for ( let i = 1; i < len - 1; i++) {
    chatArray.push({
      role: 'model',
      parts: [{text: chatHistory[i].answer}]
    })
    chatArray.push( {
      role: 'user',
      parts: [{text: chatHistory[i].question}]
    })
  }

  //Gemini chatHistory ends with model
  chatArray.push({
    role: 'model',
    parts: [{text: chatHistory[len - 1].answer}]
  })

  return chatArray
}


const getGeminiChatCompletion = async (
  basePrompt: string,
  chatHistory: Message[],
  userMessage: string,
  fetchedText: string,
  selectedModel: OptionType,
  base64Images: string[]
) => {
 
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
 
  const maxReturnMessageToken = 10000

  const systemContent = "You are an AI assistant, skilled and equipped with a specialized data source as well as a vast reservoir of general knowledge. When a user presents a question, they can prompt you to extract relevant information from this data source. If information is obtained, it will be flagged with '''fetchedStart and closed with fetchedEnd'''. Only use the fetched data if it is directly relevant to the user's question and can contribute to a reasonable correct answer. Otherwise, rely on your pre-existing knowledge to provide the best possible response. For difficult problems, solve step-by-step."

  const userTextWithFetchedData = fetchedText!=='' ? userMessage + '\n' + " '''fetchedStart " + fetchedText + " fetchedEnd'''"+ '\n'+ basePrompt : userMessage +'\n' + basePrompt

 const model = genAI.getGenerativeModel({ 
    model: selectedModel.value,
    systemInstruction: systemContent
  })

  const currentUserParts = await getCurrentUserParts(base64Images, userTextWithFetchedData)
 
 try {
    const chat = model.startChat({
      history: buildChatArray(chatHistory),
      generationConfig: {
        maxOutputTokens: maxReturnMessageToken,
      },
    });
  
    const result = await chat.sendMessage(currentUserParts);
    const text = result.response.text();

    return text 

  } catch(error) {
    throw new Error(`Failed to fetch response from Google ${selectedModel} model, ${error}`)
  }

}

export default getGeminiChatCompletion

