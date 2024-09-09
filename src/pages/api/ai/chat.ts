import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone';
import getClaudeChatCompletion from '@/src/services/llm/claude';
import getGeminiChatCompletion from '@/src/services/llm/gemini';
import { getGroqChatCompletion } from '@/src/services/llm/groq';
import {
  createEmbedding,
  getOpenAIChatCompletion
} from '@/src/services/llm/openai';
import getOpenModelChatCompletion from '@/src/services/llm/opensourceai';

import {
  processImageFiles,
  processNonMediaFiles
} from '@/src/utils/processMessageFile';
import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/chatMessageHelper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { aiConfig, namespace, selectedModel, chatHistory, fileSrc } = req.body;

  let { question } = req.body;

  if (!question && fileSrc.length === 0) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  if (!selectedModel?.value) {
    return res.status(500).json('Model name is missing.');
  }

  const base64ImageSrc = processImageFiles(fileSrc);

  question += await processNonMediaFiles(fileSrc);

  // Replace multiple newlines with a single newline to avoid excessive spacing
  const pretreatedQuestion = question.trim().replace(/\n\s*\n/g, '\n');

  try {
    let fetchedText = '';

    //fetch text from vector database
    if (namespace && namespace !== 'none') {
      const embeddedQuery = await createEmbedding(question);
      fetchedText = await fetchDataFromPinecone(embeddedQuery, namespace);
    }

    // get response from AI
    const { category } = selectedModel;
    let chatResponse: string | undefined | null;

    switch (category) {
      case 'openai':
        chatResponse = await getOpenAIChatCompletion(
          aiConfig,
          chatHistory,
          pretreatedQuestion,
          fetchedText,
          selectedModel,
          base64ImageSrc
        );
        break;

      case 'groq':
        chatResponse = await getGroqChatCompletion(
          aiConfig,
          chatHistory,
          pretreatedQuestion,
          fetchedText,
          selectedModel
        );
        break;

      case 'google':
        chatResponse = await getGeminiChatCompletion(
          aiConfig,
          chatHistory,
          pretreatedQuestion,
          fetchedText,
          selectedModel,
          base64ImageSrc
        );
        break;

      case 'anthropic':
        chatResponse = await getClaudeChatCompletion(
          aiConfig,
          chatHistory,
          pretreatedQuestion,
          fetchedText,
          selectedModel,
          base64ImageSrc
        );
        break;

      case 'hf-small':
      case 'hf-large':
        const baseUrl =
          category === 'hf-small'
            ? process.env.NEXT_PUBLIC_SERVER_URL
            : process.env.NEXT_PUBLIC_SERVER_GPU_URL;
        if (!baseUrl) {
          return res
            .status(500)
            .json(
              `Url address for posting the data to ${selectedModel} is missing`
            );
        }
        const url = `${baseUrl}/api/chat_${category === 'hf-small' ? 'cpu' : 'gpu'}`;
        chatResponse = await getOpenModelChatCompletion(
          aiConfig,
          chatHistory,
          pretreatedQuestion,
          fetchedText,
          selectedModel,
          url
        );
        break;

      default:
        return res.status(500).json('Invalid model category');
    }

    let answer: string;
    let subject: string;
    if (!chatResponse) {
      answer = "Sorry, I'm having trouble finding an answer to your question.";
      subject = 'Unknown';
    } else {
      answer = extractMessageContent(chatResponse);
      subject = extractSubjectTitle(chatResponse);
    }
   
    res.status(200).json({ answer, subject });
  } catch (error: any) {
    console.error('An error occurred: ', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
