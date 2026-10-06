import type { PullRequest } from "./pullRequest";
import type { SearchQuery } from "./searchQuery";

export type Cache = {
	readonly query: SearchQuery;
	readonly fetchedAt: string;
	readonly pullRequests: readonly PullRequest[];
};
