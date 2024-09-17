import { modelOptions } from '@/config/modellist';
import { AssistantOption } from '@/src/types/chat';

export const defaultModel = modelOptions[0];

export const defaultAssistants: AssistantOption[] = modelOptions.map(model => ({
  value: `default-${model.value}`,
  label: `Default ${model.label}`,
  isDefault: true,
  config: {
    name: `Default ${model.label}`,
    role: 'Default Assistant',
    model: model,
    topP: 0.7,
    temperature: 0.7,
    basePrompt: ''
  }
}));

export const initialMessage = {
  question: '',
  answer:
    'Hi! Please start by asking a question. You can click tag icons to add tags once the chat begins.',
  assistant: defaultAssistants[0].label
};
