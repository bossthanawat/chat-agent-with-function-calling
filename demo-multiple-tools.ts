import { ChatAgent } from "./agent";

async function main() {
  const agent = new ChatAgent({ 
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o-mini",
    tools: ["getCurrentWeather", "searchRestaurants", "getStockPrice"],
  });

  // ตั้งค่า system message
  agent.addMessage({
    role: "system",
    content: "You are a helpful assistant that can provide information about weather, restaurants, and stock prices.",
  });

  // ทดสอบถามหลายๆ อย่างในข้อความเดียว
  const response = await agent.chat(
    "What's the weather like in Bangkok? Also, can you find some good Thai restaurants there? And what's the current price of Apple stock?"
  );
  
  console.log("Assistant:", response);
}

main().catch(console.error); 