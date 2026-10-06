export type SearchQuery = string & { readonly __brand: "SearchQuery" };

// The GitHub search API returns at most 1,000 results per query.
export const SEARCH_LIMIT = 1000;

export function createSearchQuery(input: string): SearchQuery {
	const trimmed = input.trim();
	if (trimmed === "") {
		throw new Error("A search query is required.");
	}
	return trimmed as SearchQuery;
}

export const DEFAULT_QUERY: SearchQuery = createSearchQuery(
	"is:pr review-requested:@me state:open archived:false -is:draft",
);
