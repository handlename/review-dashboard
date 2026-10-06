import type { PullRequest } from "./pullRequest";
import type { SearchQuery } from "./searchQuery";

export type Cache = {
	readonly query: SearchQuery;
	readonly fetchedAt: string;
	readonly pullRequests: readonly PullRequest[];
};

// A cache for another search query is never shown (FR-CACHE-6).
export function cacheFor(cache: Cache | null, query: SearchQuery): Cache | null {
	return cache !== null && cache.query === query ? cache : null;
}
