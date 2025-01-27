import { AVAILABLE_TOOLS } from './tools';
import { AvailableToolNames } from './tools';

interface ChatAgentConfig {
  apiKey: string;
  model?: string;
  tools?: AvailableToolNames[];
}

export class ChatAgent {
    private apiKey: string;
    private model: string;
    private tools: ToolDefinition[];
    private messages: Message[];
  
    constructor(config: ChatAgentConfig) {
      this.apiKey = config.apiKey;
      this.model = config.model || 'gpt-4o-mini';
      this.tools = [];
      this.messages = [];
      
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
  
    addMessage(message: Message) {
      this.messages.push(message);
    }
  
    private async callOpenAI(): Promise<any> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.messages,
          tools: this.tools,
          tool_choice: 'auto',
        }),
      });
  
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
  
      return response.json();
    }
  
    private async processResponse(response: any): Promise<string> {
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
        return finalResponse.choices[0].message.content;
      }
  
      return message.content;
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