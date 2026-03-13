import OpenAI from "openai";

// Server-side only OpenAI client
// OPENAI_API_KEY must be set in .env.local
let clientInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!clientInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured. Add it to your .env.local file."
      );
    }
    clientInstance = new OpenAI({ apiKey });
  }
  return clientInstance;
}

export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
