import { programs } from '../data/programs.js';
import { requirements } from '../data/requirements.js';
import type { Program, Requirement } from '../types/index.js';
import { findOrThrow } from '../utils/findOrThrow.js';

export interface ProgramFilters {
  university?: string;
  degreeType?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProgramDetail = Program & { requirements: Requirement[] };

export const programService = {
  list(
    filters: ProgramFilters,
    pagination: PaginationOptions,
  ): PaginatedResult<Program> {
    let results = programs as Program[];

    if (filters.university) {
      const q = filters.university.toLowerCase();
      results = results.filter((p) => p.university.toLowerCase().includes(q));
    }

    if (filters.degreeType) {
      const q = filters.degreeType.toLowerCase();
      results = results.filter((p) => p.degreeType.toLowerCase() === q);
    }

    const total = results.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const data = results.slice(start, start + pagination.limit);

    return { data, total, page: pagination.page, limit: pagination.limit, totalPages };
  },

  getById(id: string): ProgramDetail {
    const program = findOrThrow(programs, (p) => p.id === id, 'Program');
    const programRequirements = requirements.filter((r) => r.programId === id);
    return { ...program, requirements: programRequirements };
  },
};
