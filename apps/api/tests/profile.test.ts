import { afterEach, describe, expect, it } from 'vitest';
import { profiles } from '../src/data/profiles.js';
import { profileService } from '../src/services/profile.js';

const NOW = '2026-01-01T00:00:00.000Z';

// Snapshot original seed data length so we can restore cleanly
const SEED_LENGTH = profiles.length;

afterEach(() => {
  // Remove any profiles added during tests, preserving seed data
  profiles.splice(SEED_LENGTH);
});

describe('profileService.create', () => {
  it('creates a new profile and returns created: true', () => {
    const input = {
      name: 'Test Student',
      email: 'test.student@example.com',
      gpa: 3.5,
      educationLevel: 'bachelor' as const,
      targetTerm: 'Fall 2027',
      selectedProgramIds: [],
    };
    const { profile, created } = profileService.create(input, NOW);
    expect(created).toBe(true);
    expect(profile.name).toBe('Test Student');
    expect(profile.email).toBe('test.student@example.com');
    expect(profile.gpa).toBe(3.5);
    expect(profile.createdAt).toBe(NOW);
    expect(profile.updatedAt).toBe(NOW);
    expect(profile.id).toBeTruthy();
  });

  it('normalizes email to lowercase on create', () => {
    const { profile } = profileService.create(
      { name: 'Caps Test', email: 'CAPS@EXAMPLE.COM', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    expect(profile.email).toBe('caps@example.com');
  });

  it('is idempotent — same email returns existing profile with created: false', () => {
    const input = {
      name: 'Idempotent Student',
      email: 'idempotent@example.com',
      gpa: 3.7,
      educationLevel: 'bachelor' as const,
      targetTerm: 'Fall 2027',
      selectedProgramIds: [],
    };
    const first = profileService.create(input, NOW);
    const second = profileService.create(input, NOW);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.profile.id).toBe(first.profile.id);
  });

  it('generates deterministic ID from email', () => {
    const input = {
      name: 'Det Test',
      email: 'det.test@example.com',
      gpa: 3.0,
      educationLevel: 'bachelor' as const,
      targetTerm: 'Fall 2027',
      selectedProgramIds: [],
    };
    const { profile: p1 } = profileService.create(input, NOW);
    profiles.splice(SEED_LENGTH); // reset
    const { profile: p2 } = profileService.create(input, NOW);
    expect(p1.id).toBe(p2.id);
  });

  it('stores empty object for testScores when not provided', () => {
    const { profile } = profileService.create(
      { name: 'No Scores', email: 'noscores@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    expect(profile.testScores).toEqual({});
  });
});

describe('profileService.update', () => {
  it('updates name and returns updated profile', () => {
    const { profile } = profileService.create(
      { name: 'Before', email: 'update.test@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    const updated = profileService.update(profile.id, { name: 'After' }, NOW);
    expect(updated.name).toBe('After');
    expect(updated.updatedAt).toBe(NOW);
  });

  it('throws 404 for unknown profile id', () => {
    expect(() => profileService.update('no-such-id', { name: 'x' }, NOW)).toThrow('Profile not found');
  });

  it('throws 409 when email is already taken by another profile', () => {
    const { profile: p1 } = profileService.create(
      { name: 'P1', email: 'conflict.p1@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    const { profile: p2 } = profileService.create(
      { name: 'P2', email: 'conflict.p2@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    expect(() => profileService.update(p2.id, { email: p1.email }, NOW)).toThrow('Email already in use');
  });

  it('normalizes email to lowercase on update', () => {
    const { profile } = profileService.create(
      { name: 'Email Case', email: 'emailcase@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    const updated = profileService.update(profile.id, { email: 'EMAILCASE@EXAMPLE.COM' }, NOW);
    // Same email, just uppercased — no change detected after normalization
    expect(updated.email).toBe('emailcase@example.com');
  });

  it('is a no-op when patch fields already match stored values', () => {
    const { profile } = profileService.create(
      { name: 'Noop Test', email: 'noop@example.com', gpa: 3.5, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    const result = profileService.update(profile.id, { name: 'Noop Test' }, NOW);
    expect(result).toBe(profiles.find((p) => p.id === profile.id)); // same reference
  });

  it('allows updating GPA', () => {
    const { profile } = profileService.create(
      { name: 'GPA Test', email: 'gpa.test@example.com', gpa: 3.0, educationLevel: 'bachelor' as const, targetTerm: 'Fall 2027', selectedProgramIds: [] },
      NOW,
    );
    const updated = profileService.update(profile.id, { gpa: 3.9 }, NOW);
    expect(updated.gpa).toBe(3.9);
  });
});
