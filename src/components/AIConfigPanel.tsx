import React, {
  ChangeEvent,
  FormEvent,
  useState,
  useEffect,
  SetStateAction,
  Dispatch
} from 'react';
import { useRouter } from 'next/router';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card';
import { Slider } from '@/src/components/ui/slider';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

import CustomSelect from '@/src/components/CustomSelect';
import Notification from '@/src/components/Notification';
import { useChatContext } from '@/src/context/ChatContext';
import { OptionType } from '@/src/types/common';
import { AIConfig } from '@/src/types/chat';
import {
  postAIConfig,
  getAIConfigs
} from '@/src/utils/sqliteAIConfigApiClient';
interface AIConfigPanelProps {
  handleModelChange: (newValue: OptionType) => void;
  selectedNamespace: OptionType | null;
  handleNamespaceChange: (selectedOption: OptionType | null) => void;
  aiConfig: AIConfig;
  setAIConfig: Dispatch<SetStateAction<AIConfig>>;
  modelOptions: OptionType[];
  fileCategoryOptions: OptionType[];
}

export default function AIConfigPanel({
  handleModelChange,
  selectedNamespace,
  handleNamespaceChange,
  aiConfig,
  setAIConfig,
  modelOptions,
  fileCategoryOptions
}: AIConfigPanelProps) {
  const router = useRouter();

  const { selectedModel } = useChatContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [existingNames, setExistingNames] = useState<string[]>([]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setAIConfig(prevConfig => ({ ...prevConfig, [id]: value }));
    setSubmissionSuccess('');
    setSubmissionError('');
  };

  const handleSliderChange = (id: string) => (value: number[]) => {
    setAIConfig({ ...aiConfig, [id]: value[0] });
  };

  const validateForm = () => {
    if (
      !aiConfig.name.trim() ||
      !aiConfig.role.trim() ||
      !selectedModel.value.trim()
    ) {
      setSubmissionError('Please fill in all required fields.');
      return false;
    }

    if (existingNames.includes(aiConfig.name)) {
      setSubmissionError('An AI assistant with this name already exists.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const token = window.localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }
    const selectedNamespaceValue = selectedNamespace?.value || '';

    try {
      const response = await postAIConfig(
        token,
        aiConfig,
        selectedNamespaceValue
      );

      if (response.error) {
        setSubmissionError('Failed to save AI Config. Please try again.');
      }

      setSubmissionSuccess(response.message);
      setAIConfig(prevConfig => ({ ...aiConfig, name: '' })); // Clear name field after success
    } catch (error: any) {
      setSubmissionError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchExistingNames = async () => {
      const token = window.localStorage.getItem('token');
      if (token) {
        try {
          const configs = await getAIConfigs(token);
          setExistingNames(configs.map(config => config.name));
        } catch (error) {
          console.error('Failed to fetch existing AI configs:', error);
        }
      }
    };
    fetchExistingNames();
  }, []);

  const isButtonDisabled =
    !aiConfig.name || !aiConfig.role || !selectedModel.value || isSubmitting;

  return (
    <Card className="w-full mx-auto shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-50 via-gray-200  to-blue-100 border-b border-gray-300  shadow-sm shadow-cyan-200 drop-shadow-sm">
        <CardTitle className="text-center text-gray-800">
          Configure AI Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-slate-100">
        <form onSubmit={handleSubmit} className="pt-6 pb-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                value={aiConfig.name}
                onChange={handleInputChange}
                placeholder="Enter assistant name"
                className="w-full bg-gray-50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Assistant Role</Label>
              <Input
                id="role"
                value={aiConfig.role}
                onChange={handleInputChange}
                placeholder="Enter assistant role"
                className="w-full bg-gray-50"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="namespace">Select RAG Namespace</Label>
            <CustomSelect
              id="namespace"
              options={[
                { value: 'none', label: 'None' },
                ...fileCategoryOptions
              ]}
              value={selectedNamespace?.value || 'none'}
              onChange={value => {
                const newSelectedNamespace = [
                  { value: 'none', label: 'None' },
                  ...fileCategoryOptions
                ].find(option => option.value === value);
                handleNamespaceChange(
                  value !== 'none' ? newSelectedNamespace || null : null
                );
              }}
              placeholder="Select RAG namespace"
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <label htmlFor="model" className="text-gray-700">
                Choose AI Model
              </label>
              <CustomSelect
                id="model"
                options={modelOptions}
                value={selectedModel.value}
                onChange={value => {
                  const newSelectedModel = modelOptions.find(
                    option => option.value === value
                  );
                  if (newSelectedModel) {
                    handleModelChange(newSelectedModel);
                  }
                }}
                placeholder="Select a model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topP" className="text-gray-700">
                Model Top P: {aiConfig.topP.toFixed(2)}
              </Label>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.01}
                value={[aiConfig.topP]}
                onValueChange={handleSliderChange('topP')}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-gray-700">
                Model Temperature: {aiConfig.temperature.toFixed(2)}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.01}
                value={[aiConfig.temperature]}
                onValueChange={handleSliderChange('temperature')}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrompt" className="text-gray-700">
              Enter Information You Want AI to Remember
            </Label>
            <Textarea
              id="basePrompt"
              rows={4}
              value={aiConfig.basePrompt}
              onChange={handleInputChange}
              placeholder="Enter text here for AI to remember throughout the chat"
              className="w-full resize-none bg-gray-50"
            />
          </div>
          {submissionError && (
            <Notification type="error" message={submissionError} />
          )}
          {submissionSuccess && (
            <Notification type="success" message={submissionSuccess} />
          )}
          <Button
            type="submit"
            className={cn(
              'w-full bg-gradient-to-r from-indigo-100 via-gray-800  to-slate-600 text-white font-semibold py-2 px-4 rounded shadow-sm shadow-cyan-200 drop-shadow-sm ',
              isButtonDisabled && 'cursor-not-allowed'
            )}
            disabled={isButtonDisabled}
          >
            {isSubmitting ? 'Submitting...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
