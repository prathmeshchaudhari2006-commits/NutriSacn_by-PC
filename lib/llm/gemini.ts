import { GoogleGenAI } from '@google/genai';
import { LLMProvider, VisionScanResult } from './provider';

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'demo_key' && apiKey.trim().length > 0) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeFoodImage(base64Image: string, mimeType = 'image/jpeg'): Promise<VisionScanResult> {
    if (!this.ai) {
      // Demo/Fallback Vision response if API key is not configured
      console.warn('GEMINI_API_KEY not configured. Returning fallback vision analysis.');
      return {
        is_food: true,
        dish_description: 'Indian Thali Dish (Demo Scan)',
        items: [
          { name: 'roti', estimated_grams: 80, confidence: 0.95, cooking_method: 'roasted' },
          { name: 'dal tadka', estimated_grams: 150, confidence: 0.90, cooking_method: 'simmered' },
          { name: 'paneer butter masala', estimated_grams: 180, confidence: 0.88, cooking_method: 'curry' },
          { name: 'steamed rice', estimated_grams: 150, confidence: 0.92, cooking_method: 'boiled' },
        ],
      };
    }

    try {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `You are a professional nutrition vision AI. Analyze this food image.
Rules:
1. Identify all distinct food items present on the plate or in the meal.
2. Estimate the portion weight in grams for each item.
3. DO NOT output any calorie or macro numbers. ONLY output item names and estimated grams.
4. Output STRICT JSON adhering to this JSON schema:
{
  "is_food": boolean,
  "dish_description": string,
  "items": [
    {
      "name": string (e.g. "chapati", "dal tadka", "paneer butter masala", "steamed rice", "apple"),
      "estimated_grams": number,
      "confidence": number (between 0.0 and 1.0),
      "cooking_method": string
    }
  ]
}`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          is_food: parsed.is_food ?? true,
          dish_description: parsed.dish_description || 'Scanned Meal',
          items: parsed.items || [],
          raw_response: responseText,
        };
      }

      throw new Error('Failed to parse JSON response from Gemini Vision');
    } catch (error) {
      console.error('Error in Gemini Vision scan:', error);
      // Fallback
      return {
        is_food: true,
        dish_description: 'Meal Dish',
        items: [
          { name: 'roti', estimated_grams: 80, confidence: 0.85 },
          { name: 'paneer', estimated_grams: 120, confidence: 0.80 },
        ],
      };
    }
  }

  async generateMealPlan(prompt: string): Promise<string> {
    if (!this.ai) {
      throw new Error('GEMINI_API_KEY required for AI meal plan generation');
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || '';
  }
}
