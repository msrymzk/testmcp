import { CreateMessageRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { mcpLogger } from '../utils/logger.js';

export interface PreprocessingConfig {
  enabled: boolean;
  systemPrompt: string;
  priority: 'high' | 'medium' | 'low';
  includeContext: boolean;
}

export const defaultPreprocessingConfig: PreprocessingConfig = {
  enabled: true,
  systemPrompt: `あなたは計算機能付きのAIアシスタントです。

重要な指示:
1. 数学的計算が必要な場合は、必ず利用可能なcalculatorツール（add, subtract, multiply, divide）を使用してください
2. 情報が必要な場合は、利用可能なリソース（test://server-info, test://capabilities, test://sample-data）を参照してください
3. 複雑な計算手順が必要な場合は、calculateプロンプトやexplain-mathプロンプトの使用を検討してください
4. すべての計算結果は正確性を保つため、ツールによる計算結果を使用してください

利用可能な機能:
- 計算ツール: add, subtract, multiply, divide
- 情報リソース: server-info, capabilities, sample-data  
- プロンプト: calculate, explain-math, help

この前処理メッセージの後に続くユーザーの質問に対して、適切なツールやリソースを活用して回答してください。`,
  priority: 'high',
  includeContext: true
};

export function createPreprocessingMessage(
  originalMessages: any[],
  config: PreprocessingConfig = defaultPreprocessingConfig
) {
  if (!config.enabled) {
    return originalMessages;
  }

  const preprocessingMessage = {
    role: 'system' as const,
    content: {
      type: 'text',
      text: config.systemPrompt
    }
  };

  // システムメッセージを最初に配置
  const systemMessages = originalMessages.filter(msg => msg.role === 'system');
  const nonSystemMessages = originalMessages.filter(msg => msg.role !== 'system');

  const processedMessages = [
    ...systemMessages,
    preprocessingMessage,
    ...nonSystemMessages
  ];

  return processedMessages;
}

export function shouldPreprocess(request: any): boolean {
  // sampling requestの場合のみ前処理を適用
  return request.method === 'sampling/createMessage';
}

export async function handlePreprocessing(request: any, config?: PreprocessingConfig) {
  mcpLogger.debug('=== PREPROCESSING DEBUG LOG START ===');
  mcpLogger.debug('Request method:', request.method);
  mcpLogger.debug('Should preprocess:', shouldPreprocess(request));
  
  if (!shouldPreprocess(request)) {
    mcpLogger.debug('Skipping preprocessing - not a sampling request');
    mcpLogger.debug('=== PREPROCESSING DEBUG LOG END ===');
    return request;
  }

  mcpLogger.debug('--- INPUT DATA ---', {
    requestParamsKeys: Object.keys(request.params || {}),
    originalRequestStructure: {
      method: request.method,
      params: {
        ...request.params,
        messages: request.params?.messages?.map((msg: any, index: number) => ({
          index,
          role: msg.role,
          contentType: msg.content?.type,
          contentLength: msg.content?.text?.length || 0,
          contentPreview: msg.content?.text?.substring(0, 100) + (msg.content?.text?.length > 100 ? '...' : '')
        }))
      }
    }
  });

  const originalMessages = request.params.messages || [];
  mcpLogger.debug('Original messages count:', originalMessages.length);

  const processedMessages = createPreprocessingMessage(originalMessages, config);

  mcpLogger.debug('--- OUTPUT DATA ---', {
    processedMessagesCount: processedMessages.length,
    processedMessagesStructure: processedMessages.map((msg: any, index: number) => ({
      index,
      role: msg.role,
      contentType: msg.content?.type,
      contentLength: msg.content?.text?.length || 0,
      contentPreview: msg.content?.text?.substring(0, 100) + (msg.content?.text?.length > 100 ? '...' : ''),
      isPreprocessingMessage: msg.content?.text?.includes('計算機能付きのAIアシスタント')
    }))
  });

  const result = {
    ...request,
    params: {
      ...request.params,
      messages: processedMessages
    }
  };

  mcpLogger.debug('--- FINAL RESULT ---', {
    resultStructureKeys: Object.keys(result),
    resultParamsKeys: Object.keys(result.params || {})
  });
  mcpLogger.debug('=== PREPROCESSING DEBUG LOG END ===');

  return result;
}