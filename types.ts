export interface Ingredient {
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  prepTime: string; // e.g. "30 min"
  calories: number;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: string[];
  tags: string[];
  description: string;
  imageUrl?: string;
}

export interface AnalysisResult {
  detectedIngredients: string[];
  recipes: Recipe[];
}

export interface DietaryFilter {
  id: string;
  label: string;
  active: boolean;
}

export enum AppView {
  HOME = 'HOME',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  COOKING = 'COOKING',
  SHOPPING = 'SHOPPING'
}