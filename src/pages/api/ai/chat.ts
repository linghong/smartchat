import type { NextApiRequest, NextApiResponse } from 'next';

import {
  OPENAI_API_KEY,
  CLAUDE_API_KEY,
  GEMINI_API_KEY,
  GROQ_API_KEY
} from '@/config/env';
import { AIProviderFactory } from '@/src/services/llm/AIProviderFactory';
import { fetchDataFromPinecone } from '@/src/services/rag/fetchDataFromPinecone';
import { createEmbedding } from '@/src/services/rag/embedding';
import {
  processImageFiles,
  processNonMediaFiles
} from '@/src/utils/fileHelper/processMessageFile';
import {
  extractMessageContent,
  extractSubjectTitle
} from '@/src/utils/guardrails/chatMessageHelper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { namespace, selectedAssistant, chatHistory, fileSrc } = req.body;

  let { question } = req.body;

  if (!question && fileSrc.length === 0) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  if (!selectedAssistant?.config.model.value) {
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
    const { category } = selectedAssistant.config.model;

    let apiKey: string | undefined;
    let baseUrl: string | undefined;
    switch (category) {
      case 'openai':
        apiKey = OPENAI_API_KEY;
        break;
      case 'anthropic':
        apiKey = CLAUDE_API_KEY;
        break;
      case 'google':
        apiKey = GEMINI_API_KEY;
        break;
      case 'groq':
        apiKey = GROQ_API_KEY;
        break;
      case 'hf-small':
      case 'hf-large':
        apiKey = process.env.NEXT_PUBLIC_SERVER_SECRET_KEY;
        baseUrl =
          category === 'hf-small'
            ? process.env.NEXT_PUBLIC_SERVER_URL
            : process.env.NEXT_PUBLIC_SERVER_GPU_URL;
        if (!baseUrl) {
          return res.status(500).json(`Base URL for ${category} is missing`);
        }
        break;
      default:
        return res.status(500).json('Invalid model category');
    }

    if (!apiKey) {
      return res.status(500).json(`API key for ${category} is missing`);
    }

    const aiProvider = AIProviderFactory.createProvider(
      category,
      apiKey,
      baseUrl
    );

    const chatResponse: string | undefined | null =
      await aiProvider.getChatCompletion(
        chatHistory,
        pretreatedQuestion,
        fetchedText,
        selectedAssistant,
        base64ImageSrc
      );

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
