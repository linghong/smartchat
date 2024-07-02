import type { NextApiRequest, NextApiResponse } from 'next';
import { marked } from 'marked';

import { fetchDataFromPinecone } from '@/src/services/fetchDataFromPinecone';
import getGeminiChatCompletion from '@/src/services/llm/gemini';
import getClaudeChatCompletion from '@/src/services/llm/claude';
import { getGroqChatCompletion } from '@/src/services/llm/groq';
import {
  createEmbedding,
  getOpenAIChatCompletion
} from '@/src/services/llm/openai';
import getOpenModelChatCompletion from '@/src/services/llm/opensourceai';
import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/chatMessageHelper';
import { ImageFile } from '@/src/types/chat';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    basePrompt,
    question,
    namespace,
    selectedModel,
    chatHistory,
    imageSrc
  } = req.body;

  if (!question && imageSrc.length === 0) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  if (!selectedModel?.value) {
    return res.status(500).json('Model name is missing.');
  }

  const base64ImageSrc = imageSrc?.map((imgSrc: ImageFile) => ({
    ...imgSrc,
    base64Image: imgSrc.base64Image.split(',')[1]
  }));

  // replacing newlines with spaces
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

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
          basePrompt,
          chatHistory,
          sanitizedQuestion,
          fetchedText,
          selectedModel,
          base64ImageSrc
        );
        break;

      case 'groq':
        chatResponse = await getGroqChatCompletion(
          basePrompt,
          chatHistory,
          sanitizedQuestion,
          fetchedText,
          selectedModel
        );
        break;

      case 'google':
        chatResponse = await getGeminiChatCompletion(
          basePrompt,
          chatHistory,
          sanitizedQuestion,
          fetchedText,
          selectedModel,
          base64ImageSrc
        );
        break;

      case 'anthropic':
        chatResponse = await getClaudeChatCompletion(
          basePrompt,
          chatHistory,
          sanitizedQuestion,
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
          basePrompt,
          chatHistory,
          sanitizedQuestion,
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

    const htmlAnswer = marked(answer);

    res.status(200).json({ answer: htmlAnswer, subject });
  } catch (error: any) {
    console.error('An error occurred: ', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
