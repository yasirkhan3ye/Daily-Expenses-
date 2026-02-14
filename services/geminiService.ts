
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageSize } from "../types";

// Always use process.env.API_KEY directly in the configuration object.
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export const chatWithGemini = async (message: string) => {
  const ai = getGeminiClient();
  // Using gemini-3-pro-preview for complex reasoning tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: message }] }],
    config: {
      systemInstruction: 'You are an expert financial advisor named Hisaab AI. Help the user manage their expenses, plan budgets, and explain financial concepts concisely. Focus on dual-currency management (EUR and PKR) when asked.'
    }
  });
  return response.text;
};

export const generateImage = async (prompt: string, size: ImageSize) => {
  // Creating a new instance right before making an API call for gemini-3 series models.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: size as any },
    },
  });
  // Iterate through parts to find the image part, as text might also be present.
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data found");
};

export const extractTransactionsFromText = async (rawContent: string) => {
  const ai = getGeminiClient();
  const prompt = `Analyze financial data for Hisaab AI. Extract amount, category, date (YYYY-MM-DD), type (income/expense), and description. Data: ${rawContent}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            date: { type: Type.STRING },
            type: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ['amount', 'category', 'date', 'type', 'description'],
          propertyOrdering: ["amount", "category", "date", "type", "description"]
        }
      }
    }
  });
  try { return JSON.parse(response.text.trim()); } catch { return []; }
};

export const analyzeReceipt = async (base64Image: string) => {
  const ai = getGeminiClient();
  const data = base64Image.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: data
          }
        },
        {
          text: 'Analyze this receipt image for Hisaab AI. Extract: amount (number), category (one word), date (YYYY-MM-DD), type (expense/income), and description. Output JSON.'
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          date: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['amount', 'category', 'date', 'type', 'description'],
        propertyOrdering: ["amount", "category", "date", "type", "description"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text.trim());
  } catch (err) {
    console.error("Failed to parse receipt data", err);
    return null;
  }
};

export const fetchExchangeRates = async (baseCurrency: string, targets: string[]) => {
  const ai = getGeminiClient();
  const prompt = `Fetch current live exchange rate for 1 ${baseCurrency} to ${targets.join(', ')}. Use Google Search grounding. Return ONLY a JSON object containing the rates.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
    }
  });
  // Since search grounding response.text might not be clean JSON, use a safer extraction.
  try {
    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
};

export const fetchHistoricalRates = async (base: string, target: string) => {
  const ai = getGeminiClient();
  const prompt = `Provide historical exchange rate data for ${base} to ${target} over the last 30 days. Output exactly 7 objects with 'date' and 'rate' as JSON array.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
    }
  });
  try {
    const text = response.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
};

export const generateSpeech = async (text: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const decodeBase64Audio = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
