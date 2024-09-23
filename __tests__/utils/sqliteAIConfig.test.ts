import { AIConfig } from '@/src/types/chat';
import { OptionType } from '@/src/types/common';
import { postAIConfig, getAIConfigs } from '@/src/utils/sqliteAIConfigApiClient';

// Mock the fetch function
global.fetch = jest.fn();

describe('sqliteAIConfigApiClient', () => {
  describe('postAIConfig', () => {
    it('should return an empty array if token is not provided', async () => {
      const result = await postAIConfig('', { name: 'test', role: 'test', model: { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' } as OptionType, basePrompt: 'test', temperature: 0.5, topP: 0.5 } as AIConfig, 'test-namespace');
      expect(result).toEqual([]);
    });

    it('should post AI config successfully', async () => {
      const mockResponse = { ok: true, json: () => Promise.resolve({ id: '1' }) };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const token = 'test-token';
      const aiConfig: AIConfig = {
        name: 'test',
        role: 'test',
        model: { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' } as OptionType,
        basePrompt: 'test',
        temperature: 0.5,
        topP: 0.5
      };
      const namespace = 'test-namespace';
      const result = await postAIConfig(token, aiConfig, namespace);

      expect(fetch).toHaveBeenCalledWith('/api/aiconfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...aiConfig, metadata: { namespace } })
      });
      expect(result).toEqual({ id: '1' });
    });

    it('should handle error when posting AI config', async () => {
      const mockResponse = { ok: false, statusText: 'Error' };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const token = 'test-token';
      const aiConfig: AIConfig = {
        name: 'test',
        role: 'test',
        model: { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' } as OptionType,
        basePrompt: 'test',
        temperature: 0.5,
        topP: 0.5
      };
      const namespace = 'test-namespace';
      const result = await postAIConfig(token, aiConfig, namespace);

      expect(fetch).toHaveBeenCalledWith('/api/aiconfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...aiConfig, metadata: { namespace } })
      });
      expect(result).toEqual('Error saving AI Config');
    });
  });

  describe('getAIConfigs', () => {
    it('should return an empty array if token is not provided', async () => {
      const result = await getAIConfigs('');
      expect(result).toEqual([]);
    });

    it('should get AI configs successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', name: 'test', role: 'test', model: { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' } as OptionType, basePrompt: 'test', temperature: 0.5, topP: 0.5 }
          ] as AIConfig[])
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const token = 'test-token';
      const result = await getAIConfigs(token);

      expect(fetch).toHaveBeenCalledWith('/api/aiconfig', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(result).toEqual([
        { id: '1', name: 'test', role: 'test', model: { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' } as OptionType, basePrompt: 'test', temperature: 0.5, topP: 0.5 }
      ] as AIConfig[]);
    });

    it('should handle error when getting AI configs', async () => {
      const mockResponse = { ok: false, statusText: 'Error' };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const token = 'test-token';
      const result = await getAIConfigs(token);

      expect(fetch).toHaveBeenCalledWith('/api/aiconfig', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(result).toEqual([]);
    });
  });
});