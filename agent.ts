import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { AVAILABLE_TOOLS } from './tools';
import { AvailableToolNames } from './tools';
import OpenAI from 'openai';
import { ChatCompletionTool } from 'openai/src/resources/index.js';

interface ChatAgentConfig {
  apiKey: string;
  model?: string;
  tools?: AvailableToolNames[];
}

export class ChatAgent {
    private apiKey: string;
    private model: string;
    private tools: ChatCompletionTool[];
    private messages: ChatCompletionMessageParam[];
    private client: OpenAI;
  
    constructor(config: ChatAgentConfig) {
      this.apiKey = config.apiKey;
      this.model = config.model || 'gpt-4o-mini';
      this.tools = [];
      this.messages = [];
      this.client = new OpenAI({ apiKey: this.apiKey });

      if (config.tools) {
        config.tools.forEach(toolName => this.addTool(toolName));
      }
    }
  
    addTool(toolName: AvailableToolNames) {
      const toolDefinition = AVAILABLE_TOOLS[toolName];
      this.tools.push({
        type: "function",
        function: toolDefinition,
      });
    }
  
    addMessage(message: ChatCompletionMessageParam) {
      this.messages.push(message);
    }
  
    private async callOpenAI(): Promise<ChatCompletion> {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: this.messages,
        tools: this.tools,
      });

      return response;
    }
  
    private async processResponse(response: ChatCompletion): Promise<string> {
      const message = response.choices[0].message;
  
      if (message.tool_calls) {
        this.addMessage(message);
  
        const toolResults = await Promise.all(
          message.tool_calls.map(async (toolCall: any) => {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await this.executeTool(toolCall.function.name, args);
  
            this.addMessage({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
  
            return result;
          })
        );
  
        const finalResponse = await this.callOpenAI();
        return finalResponse.choices[0].message.content || '';
      }
  
      return message.content || '';
    }
  
    private async executeTool(name: string, args: any): Promise<any> {
      const toolMap: Record<string, (args: any) => Promise<any>> = {
        getCurrentWeather: async (args) => {
          return { temperature: 32, conditions: 'sunny and humid' };
        },
        searchRestaurants: async (args) => {
          return {
            restaurants: [
              { name: "Thai Delight", cuisine: "Thai", rating: 4.5 },
              { name: "Bangkok Kitchen", cuisine: "Thai", rating: 4.2 },
            ]
          };
        },
        getStockPrice: async (args) => {
          return {
            symbol: args.symbol,
            price: 180.25,
            currency: "USD"
          };
        }
      };

    if (name in toolMap) {
      return await toolMap[name](args);
    }

    throw new Error(`Tool ${name} not implemented`);
  }

    async chat(userMessage: string): Promise<string> {
      this.addMessage({
        role: 'user',
        content: userMessage,
      });
  
      const response = await this.callOpenAI();
      const result = await this.processResponse(response);
  
      this.addMessage({
        role: 'assistant',
        content: result,
      });
  
      return result;
    }
  }