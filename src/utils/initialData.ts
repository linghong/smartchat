import { modelOptions } from '@/config/modellist';

export const initialMessage = {
  question: '',
  answer: 'Hi, how can I assist you?',
  model: modelOptions[0].label
};

export const defaultModel = modelOptions[0];
