
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing the AI client using the API key exclusively from environment variables as required.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getShoppingAdvice(prompt: string, availableProducts: Product[]) {
    const productsContext = availableProducts.map(p => 
      `${p.title} (${p.category}, $${p.price}): ${p.description}`
    ).join('\n');

    // Querying the model using the recommended gemini-3-flash-preview for general tasks.
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Question: ${prompt}\n\nContext of available items:\n${productsContext}`,
      config: {
        systemInstruction: "You are 'NexusAssistant', a helpful AI shopping guide for NexusMarket. Recommend specific products from the list provided if they match. Be concise, friendly, and professional.",
        temperature: 0.7,
      },
    });

    // Directly accessing the text property from the response object.
    return response.text;
  }
}

export const geminiService = new GeminiService();
