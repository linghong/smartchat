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

import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

import CustomSelect from '@/src/components/CustomSelect';
import Notification from '@/src/components/Notification';
import { OptionType } from '@/src/types/common';
import { AIConfig } from '@/src/types/chat';
/*import {
  postAISpaceConfig,
  getAISpaceConfigs
} from '@/src/utils/sqliteAIConfigApiClient';*/

interface AISpaceConfig {
  name: string;
  assistants: AIConfig[];
  goal: string;
  theme: string; //theme name
  memory: string;
  privacy: {
    text: string;
    category: string;
  };
}
interface AISpaceConfigPanelProps {
  selectedModel: OptionType;
  handleModelChange: (newValue: OptionType) => void;
  selectedNamespace: OptionType | null;
  handleNamespaceChange: (selectedOption: OptionType | null) => void;
  modelOptions: OptionType[];
  fileCategoryOptions: OptionType[];
}

export default function AISpaceConfigPanel({
  selectedModel,
  handleModelChange,
  selectedNamespace,
  handleNamespaceChange,
  modelOptions,
  fileCategoryOptions
}: AISpaceConfigPanelProps) {
  const initialAISpaceConfig = {
    name: '',
    assistants: [],
    goal: '',
    theme: '', //theme name
    memory: '',
    privacy: {
      text: '',
      category: ''
    }
  };

  const themeOptions = [
    {
      label: 'Default',
      value: 'default'
    },
    {
      label: 'Brain Storming',
      value: 'brain-storming'
    }
  ];
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [aiSpaceConfig, setAISpaceConfig] =
    useState<AISpaceConfig>(initialAISpaceConfig);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setAISpaceConfig(prevConfig => ({ ...prevConfig, [id]: value }));
    setSubmissionSuccess('');
    setSubmissionError('');
  };

  const validateForm = () => {
    if (
      !aiSpaceConfig.name.trim() ||
      !aiSpaceConfig.goal.trim() ||
      !selectedModel.value.trim()
    ) {
      setSubmissionError('Please fill in all required fields.');
      return false;
    }

    if (existingNames.includes(aiSpaceConfig.name)) {
      setSubmissionError('An AI space with this name already exists.');
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

    /* try {
      const response = await postAISpaceConfig(
        token,
        aiSpaceConfig,
        selectedNamespaceValue
      );

      if (response.error) {
        setSubmissionError('Failed to save AI Config. Please try again.');
      }

      setSubmissionSuccess(response.message);
      setAISpaceConfig(prevConfig => ({ ...aiSpaceConfig, name: '' })); // Clear name field after success
    } catch (error: any) {
      setSubmissionError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }*/
  };

  useEffect(() => {
    const fetchExistingNames = async () => {
      const token = window.localStorage.getItem('token');
      if (token) {
        /*  try {
          const configs = await getAISpaceConfigs(token);
          setExistingNames(configs.map(config => config.name));
        } catch (error) {
          console.error('Failed to fetch existing AI configs:', error);
        }*/
      }
    };
    fetchExistingNames();
  }, []);

  const isButtonDisabled =
    !aiSpaceConfig.name ||
    !aiSpaceConfig.goal ||
    !selectedModel.value ||
    isSubmitting;

  return (
    <Card className="w-full mx-auto shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-indigo-50 via-gray-200  to-blue-100 border-b border-gray-300  shadow-sm shadow-cyan-200 drop-shadow-sm">
        <CardTitle className="text-center text-gray-800">
          AI Space Config
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-slate-100">
        <form onSubmit={handleSubmit} className="pt-6 pb-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              value={aiSpaceConfig.name}
              onChange={handleInputChange}
              placeholder="Enter your AI space name"
              className="w-full bg-gray-50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">AI Space Goal</Label>
            <Input
              id="goal"
              value={aiSpaceConfig.goal}
              onChange={handleInputChange}
              placeholder="Enter AI space goal"
              className="w-full bg-gray-50"
              required
            />
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
              <label htmlFor="privacy" className="text-gray-700">
                For Privacy Control:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 space-y-2">
                <div className="text-gray-700">Hide</div>
                <div>
                  <Input
                    id="masked"
                    value={aiSpaceConfig.privacy.text}
                    onChange={handleInputChange}
                    placeholder="text you want be masked before send to AI"
                    className="w-full bg-gray-50"
                    required
                  />
                </div>

                <div className="text-gray-700">, It is</div>
                <div>
                  <Input
                    id="name"
                    value={aiSpaceConfig.privacy.category}
                    onChange={handleInputChange}
                    placeholder="category for hided text"
                    className="w-full bg-gray-50"
                    required
                  />
                </div>
              </div>
            </div>
            <Button className="justify-center">
              Add a New Phrase For Hide
            </Button>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <div className="space-y-2">
              <label htmlFor="model" className="text-gray-700">
                Choose Exsiting AI Assistants
              </label>
              <CustomSelect
                id="theme"
                options={themeOptions}
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
            <Button className="justify-center">
              Define a New AI Assistant
            </Button>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <label htmlFor="model" className="text-gray-700">
              Choose AI Space Theme Template
            </label>
            <CustomSelect
              id="theme"
              options={modelOptions}
              value={selectedModel.value}
              onChange={value => {
                const newSelectedTheme = themeOptions.find(
                  option => option.value === value
                );
                if (newSelectedTheme) {
                  handleModelChange(newSelectedTheme);
                }
              }}
              placeholder="Select a theme"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory" className="text-gray-700">
              AI Space Memory:
            </Label>
            <Textarea
              id="memory"
              rows={4}
              value={aiSpaceConfig.memory}
              onChange={handleInputChange}
              placeholder="Enter text here for AI to remember in this space"
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
            {isSubmitting ? 'Submitting...' : 'Add New AI Space'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
