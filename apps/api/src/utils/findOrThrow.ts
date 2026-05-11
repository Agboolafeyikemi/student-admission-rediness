import { AppError } from './AppError.js';

export function findOrThrow<T>(
  collection: T[],
  predicate: (item: T) => boolean,
  resource: string,
): T {
  const item = collection.find(predicate);
  if (!item) throw AppError.notFound(resource);
  return item;
}
