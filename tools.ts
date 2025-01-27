export const AVAILABLE_TOOLS = {
  getCurrentWeather: {
    name: "getCurrentWeather",
    description: "Get the current weather in a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g., San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
  searchRestaurants: {
    name: "searchRestaurants",
    description: "Search for restaurants in a specific location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Location to search for restaurants",
        },
        cuisine: {
          type: "string",
          description: "Type of cuisine (optional)",
        },
      },
      required: ["location"],
    },
  },
  getStockPrice: {
    name: "getStockPrice",
    description: "Get the current stock price for a given symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Stock symbol (e.g., AAPL, GOOGL)",
        },
      },
      required: ["symbol"],
    },
  },
} as const;

export type AvailableToolNames = keyof typeof AVAILABLE_TOOLS; 