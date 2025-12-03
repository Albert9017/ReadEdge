import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ArticleAnalysis, WordDetail } from "../types";

// Helper to get API key (simulated based on requirements)
const getApiKey = (): string => {
  // In a real environment, this comes from process.env.API_KEY
  // The system prompt guarantees process.env.API_KEY is available.
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing!");
    throw new Error("API Key is missing");
  }
  return key;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const vocabSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    phonetic: { type: Type.STRING },
    definition: { type: Type.STRING },
    importance: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
  },
  required: ['word', 'definition', 'importance']
};

const segmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    originalText: { type: Type.STRING },
    translatedText: { type: Type.STRING },
    vocabulary: {
      type: Type.ARRAY,
      items: vocabSchema
    }
  },
  required: ['id', 'originalText', 'translatedText', 'vocabulary']
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    segments: {
      type: Type.ARRAY,
      items: segmentSchema
    }
  },
  required: ['title', 'segments']
};

export const analyzeArticle = async (text: string): Promise<ArticleAnalysis> => {
  try {
    const prompt = `
      You are an expert English tutor aimed at helping students intensively read English articles.
      Analyze the following English text.
      1. Create a short title for the content.
      2. Split the text into logical reading segments (e.g., paragraphs or thematic blocks).
      3. Translate each segment into fluent Chinese (Simplified).
      4. For EACH segment, identify 3-5 key difficult words or phrases. Provide their phonetic symbol (IPA), a concise Chinese definition, and importance level.
      
      Input Text:
      ${text}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful language learning assistant. Always return valid JSON.",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ArticleAnalysis;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

const wordDetailSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    phonetic: { type: Type.STRING },
    definition: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING },
    exampleSentence: { type: Type.STRING },
    usageTips: { type: Type.STRING }
  },
  required: ['word', 'phonetic', 'definition', 'partOfSpeech', 'exampleSentence', 'usageTips']
};

export const lookupWordDetail = async (word: string, contextSentence?: string): Promise<WordDetail> => {
  try {
    const prompt = `
      Analyze the English word: "${word}".
      ${contextSentence ? `Context sentence where it appears: "${contextSentence}"` : ''}
      
      Provide:
      1. Phonetic symbol (IPA).
      2. Chinese definition (relevant to the context if provided).
      3. Part of speech.
      4. An English example sentence (different from the context).
      5. A brief "usage tip" or recommended collocation (in Chinese).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wordDetailSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as WordDetail;
    }
    throw new Error("Empty response for word lookup");
  } catch (error) {
    console.error("Word lookup failed:", error);
    throw error;
  }
};