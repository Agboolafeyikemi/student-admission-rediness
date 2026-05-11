import { describe, expect, it } from 'vitest';
import { programs } from '../src/data/programs.js';
import { requirements } from '../src/data/requirements.js';
import { programService } from '../src/services/program.js';

const DEFAULT_PAGINATION = { page: 1, limit: 10 };

describe('programService.list', () => {
  it('returns all programs with no filters', () => {
    const result = programService.list({}, { page: 1, limit: programs.length });
    expect(result.data).toHaveLength(programs.length);
    expect(result.total).toBe(programs.length);
  });

  it('filters by university substring (case-insensitive)', () => {
    const result = programService.list({ university: 'stanford' }, DEFAULT_PAGINATION);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.university.toLowerCase().includes('stanford'))).toBe(true);
  });

  it('returns empty data when university filter matches nothing', () => {
    const result = programService.list({ university: 'zxzxzxzx' }, DEFAULT_PAGINATION);
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('filters by degreeType (case-insensitive exact match)', () => {
    const result = programService.list({ degreeType: 'ms' }, DEFAULT_PAGINATION);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((p) => p.degreeType.toUpperCase() === 'MS')).toBe(true);
  });

  it('combines university and degreeType filters', () => {
    // MIT's full name is "Massachusetts Institute of Technology"
    const result = programService.list({ university: 'massachusetts', degreeType: 'ms' }, DEFAULT_PAGINATION);
    expect(result.data.length).toBeGreaterThan(0);
    expect(
      result.data.every(
        (p) => p.university.toLowerCase().includes('massachusetts') && p.degreeType.toLowerCase() === 'ms',
      ),
    ).toBe(true);
  });

  it('paginates correctly — page 1 limit 2', () => {
    const result = programService.list({}, { page: 1, limit: 2 });
    expect(result.data).toHaveLength(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(Math.ceil(programs.length / 2));
  });

  it('paginates correctly — page 2 limit 2', () => {
    const page1 = programService.list({}, { page: 1, limit: 2 });
    const page2 = programService.list({}, { page: 2, limit: 2 });
    // No overlap between pages
    const ids1 = new Set(page1.data.map((p) => p.id));
    expect(page2.data.every((p) => !ids1.has(p.id))).toBe(true);
  });

  it('returns empty data for a page beyond the last', () => {
    const result = programService.list({}, { page: 999, limit: 10 });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(programs.length);
  });

  it('total reflects filtered count, not overall count', () => {
    const result = programService.list({ degreeType: 'jd' }, DEFAULT_PAGINATION);
    expect(result.total).toBeLessThan(programs.length);
    expect(result.total).toBe(result.data.length); // all fit on page 1 for small dataset
  });
});

describe('programService.getById', () => {
  it('returns program with its requirements', () => {
    const id = 'cs-stanford-ms-2026';
    const result = programService.getById(id);
    expect(result.id).toBe(id);
    const expected = requirements.filter((r) => r.programId === id);
    expect(result.requirements).toHaveLength(expected.length);
    expect(result.requirements.every((r) => r.programId === id)).toBe(true);
  });

  it('throws 404 for unknown id', () => {
    expect(() => programService.getById('no-such-program')).toThrow('Program not found');
  });

  it('each program in the dataset resolves without error', () => {
    for (const p of programs) {
      expect(() => programService.getById(p.id)).not.toThrow();
    }
  });
});
