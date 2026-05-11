import type { ChecklistItem } from '../types/index.js';

// In-memory only — resets on server restart; acceptable for assessment scope.
export const checklists: ChecklistItem[] = [];
