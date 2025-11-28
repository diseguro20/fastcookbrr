import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash as requested for faster performance
const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";
const TTS_MODEL_NAME = "gemini-2.5-flash-preview-tts";

export const analyzeFridgeImage = async (
  imageBase64: string,
  dietaryRestrictions: string[]
): Promise<AnalysisResult> => {
  
  const filtersText = dietaryRestrictions.length > 0 
    ? `Considere estritamente estas restrições alimentares: ${dietaryRestrictions.join(", ")}.` 
    : "Sem restrições alimentares específicas.";

  const prompt = `
    Você é um Chef de Cozinha brasileiro experiente.
    Analise esta imagem de uma geladeira aberta ou ingredientes.
    1. Identifique os ingredientes visíveis.
    2. Sugira 4 receitas criativas e deliciosas que podem ser feitas principalmente com esses ingredientes.
    ${filtersText}
    
    Se faltarem ingredientes essenciais para uma receita excelente, liste-os em 'missingIngredients'.
    As receitas devem ser detalhadas, com passo a passo claro.
    Responda APENAS em JSON seguindo o schema fornecido.
    Use Português do Brasil para todos os textos.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      detectedIngredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de ingredientes identificados na imagem"
      },
      recipes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Fácil", "Médio", "Difícil"] },
            prepTime: { type: Type.STRING, description: "Tempo estimado, ex: '30 min'" },
            calories: { type: Type.NUMBER, description: "Calorias estimadas por porção" },
            ingredientsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Passos detalhados de preparo" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags como 'Vegetariano', 'Rápido'" },
            description: { type: Type.STRING, description: "Breve descrição apetitosa do prato" }
          },
          required: ["id", "title", "difficulty", "prepTime", "calories", "steps", "missingIngredients", "ingredientsUsed", "tags", "description"]
        }
      }
    },
    required: ["detectedIngredients", "recipes"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const generateRecipeImage = async (title: string, description: string): Promise<string | null> => {
  try {
    const prompt = `Fotografia profissional de comida de estúdio, alta resolução, 4k, muito apetitosa, iluminação dramática: Prato de ${title}. ${description}`;
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // responseMimeType is not supported for nano banana series models for image generation
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating recipe image:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: {
        parts: [{ text }] 
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' is a high quality female voice
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};