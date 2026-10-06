import type { SearchQuery } from "../domain/searchQuery";
import { DEFAULT_QUERY, createSearchQuery } from "../domain/searchQuery";

const PARAM = "q";

export function queryFromSearch(search: string): SearchQuery | null {
	const value = new URLSearchParams(search).get(PARAM);
	if (value === null) {
		return null;
	}
	try {
		return createSearchQuery(value);
	} catch {
		return null;
	}
}

// The default query is left out so the plain URL keeps meaning "default".
export function searchFor(query: SearchQuery): string {
	return query === DEFAULT_QUERY
		? ""
		: `?${new URLSearchParams({ [PARAM]: query })}`;
}

export function loadQuery(): SearchQuery | null {
	return queryFromSearch(location.search);
}

export function pushQuery(query: SearchQuery): void {
	const search = searchFor(query);
	if (search !== location.search) {
		history.pushState(
			null,
			"",
			`${location.pathname}${search}${location.hash}`,
		);
	}
}
