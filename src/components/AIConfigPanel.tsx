import React, { ChangeEvent, FormEvent } from 'react';
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
import CustomSelect from '@/src/components/CustomSelect';
import { OptionType } from '@/src/types/common';
import { AIConfig } from '@/src/types/chat';
import { postAIConfig } from '@/src/utils/sqliteAIConfigApiClient';
interface AIConfigPanelProps {
  selectedModel: OptionType;
  handleModelChange: (newValue: OptionType) => void;
  selectedNamespace: OptionType | null;
  handleNamespaceChange: (selectedOption: OptionType | null) => void;
  aiConfig: AIConfig;
  setAIConfig: (config: AIConfig) => void;
  modelOptions: OptionType[];
  fileCategoryOptions: OptionType[];
}

export default function AIConfigPanel({
  selectedModel,
  handleModelChange,
  selectedNamespace,
  handleNamespaceChange,
  aiConfig,
  setAIConfig,
  modelOptions,
  fileCategoryOptions
}: AIConfigPanelProps) {
  const router = useRouter();

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setAIConfig({ ...aiConfig, [id]: value });
  };

  const handleSliderChange = (id: string) => (value: number[]) => {
    setAIConfig({ ...aiConfig, [id]: value[0] });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }
    const selectedNamespaceValue = selectedNamespace?.value || '';
    const response = await postAIConfig(
      token,
      aiConfig,
      selectedNamespaceValue
    );
  };

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
                Model Top P: {aiConfig.topP.toFixed(1)}
              </Label>
              <Slider
                id="topP"
                min={0}
                max={1}
                step={0.1}
                value={[aiConfig.topP]}
                onValueChange={handleSliderChange('topP')}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-gray-700">
                Model Temperature: {aiConfig.temperature.toFixed(1)}
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-100 via-gray-800  to-slate-600 text-white font-semibold py-2 px-4 rounded shadow-sm shadow-cyan-200 drop-shadow-sm"
          >
            Save Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
