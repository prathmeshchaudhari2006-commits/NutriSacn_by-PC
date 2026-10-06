export interface DetectedFoodItem {
  name: string;
  estimated_grams: number;
  confidence: number;
  cooking_method?: string;
}

export interface VisionScanResult {
  is_food: boolean;
  items: DetectedFoodItem[];
  dish_description?: string;
  raw_response?: string;
}

export interface LLMProvider {
  analyzeFoodImage(base64Image: string, mimeType?: string): Promise<VisionScanResult>;
  generateMealPlan(prompt: string): Promise<string>;
}
