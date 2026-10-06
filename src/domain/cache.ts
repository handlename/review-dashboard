import type { PullRequest } from "./pullRequest";
import type { SearchQuery } from "./searchQuery";

export type Cache = {
	readonly query: SearchQuery;
	readonly fetchedAt: string;
	readonly pullRequests: readonly PullRequest[];
};

// Keeps the newest cache first, one per search query, and at most `limit` entries.
export function withCache(caches: readonly Cache[], cache: Cache, limit: number): readonly Cache[] {
	return [cache, ...caches.filter((c) => c.query !== cache.query)].slice(0, limit);
}

// A cache for another search query is never shown (FR-CACHE-6).
export function cacheFor(cache: Cache | null, query: SearchQuery): Cache | null {
	return cache !== null && cache.query === query ? cache : null;
}
