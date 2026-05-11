import { v5 as uuidv5 } from 'uuid';
import { profiles } from '../data/profiles.js';
import type { StudentProfile } from '../types/index.js';
import { AppError } from '../utils/AppError.js';
import type { CreateProfileInput, UpdateProfileInput } from '../validators/profile.js';

// In-memory only — resets on server restart; acceptable for assessment scope.

// Fixed namespace for profile IDs. UUIDv5: SHA-1(namespace + normalized email) →
// same email always yields the same UUID across restarts and test runs.
const PROFILE_NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // RFC 4122 DNS namespace

// Compares only the keys present in patch; uses JSON.stringify to handle nested
// objects (testScores) and arrays (selectedProgramIds) correctly.
function hasChanges(existing: StudentProfile, patch: UpdateProfileInput): boolean {
  return (Object.keys(patch) as Array<keyof UpdateProfileInput>).some(
    (key) => JSON.stringify(existing[key]) !== JSON.stringify(patch[key]),
  );
}

export const profileService = {
  get(id: string): StudentProfile {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) throw AppError.notFound('Profile');
    return profile;
  },
  // Returns the profile and a flag indicating whether it was just created.
  // Callers use the flag to choose between 201 Created and 200 OK.
  // `now` defaults to real wall-clock time in production; pass a fixed ISO string
  // in tests for fully deterministic output.
  create(
    input: CreateProfileInput,
    now = new Date().toISOString(),
  ): { profile: StudentProfile; created: boolean } {
    const email = input.email.toLowerCase().trim();

    const existing = profiles.find((p) => p.email.toLowerCase() === email);
    if (existing) {
      return { profile: existing, created: false };
    }

    // ID is derived from the normalized email at creation time.
    // Changing email via PATCH does not retroactively update this ID.
    const profile: StudentProfile = {
      id: uuidv5(email, PROFILE_NS),
      ...input,
      email,
      testScores: input.testScores ?? {},
      createdAt: now,
      updatedAt: now,
    };
    profiles.push(profile);
    return { profile, created: true };
  },

  update(id: string, input: UpdateProfileInput, now = new Date().toISOString()): StudentProfile {
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw AppError.notFound('Profile');

    const patch: UpdateProfileInput = { ...input };

    if (patch.email !== undefined) {
      patch.email = patch.email.toLowerCase().trim();
      if (profiles.some((p) => p.id !== id && p.email.toLowerCase() === patch.email)) {
        throw AppError.conflict('Email already in use');
      }
    }

    // No-op if every patched field already matches the stored value.
    if (!hasChanges(profiles[idx], patch)) {
      return profiles[idx];
    }

    const updated: StudentProfile = {
      ...profiles[idx],
      ...patch,
      updatedAt: now,
    };
    profiles[idx] = updated;
    return updated;
  },
};
