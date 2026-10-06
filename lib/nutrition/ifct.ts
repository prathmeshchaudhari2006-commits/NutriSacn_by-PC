import ifctDataRaw from '@/data/ifct.json';
import { FoodItem } from './types';
import Fuse from 'fuse.js';

const ifctFoods: FoodItem[] = (ifctDataRaw as any[]).map((item) => ({
  ...item,
  source: 'IFCT',
}));

const fuse = new Fuse(ifctFoods, {
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'aliases', weight: 0.4 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
});

export function searchIFCT(query: string, limit = 5): FoodItem[] {
  if (!query || query.trim().length === 0) return ifctFoods.slice(0, limit);

  const normalizedQuery = query.trim().toLowerCase();
  
  // Try exact alias/name match first
  const exact = ifctFoods.filter(food => 
    food.name.toLowerCase() === normalizedQuery ||
    food.aliases?.some(alias => alias.toLowerCase() === normalizedQuery)
  );

  if (exact.length > 0) return exact.slice(0, limit);

  const results = fuse.search(normalizedQuery);
  return results.map(res => res.item).slice(0, limit);
}

export function getIFCTById(id: string): FoodItem | undefined {
  return ifctFoods.find(food => food.id === id);
}

export function getAllIFCTFoods(): FoodItem[] {
  return ifctFoods;
}
