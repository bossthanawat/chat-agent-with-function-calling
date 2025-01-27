import { ChatAgent } from "./agent";

async function main() {
  try {
    const agent = new ChatAgent({ 
      apiKey: process.env.OPENAI_API_KEY || "",
      model: "gpt-4o-mini",
    });

    // Add function definitions
    agent.addTool("getCurrentWeather");

    // Initialize with system message
    agent.addMessage({
      role: "system",
      content:
        "You are a helpful assistant that can use various tools to help users.",
    });

    // Start chat
    const response = await agent.chat("What's the weather like in Bangkok?");
    console.log("Assistant:", response);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();

// bun example-usage.ts
