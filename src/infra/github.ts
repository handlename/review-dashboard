import type { PullRequest } from "../domain/pullRequest";
import type { SearchQuery } from "../domain/searchQuery";
import type { FetchFailure, SearchNode, SearchPage } from "./githubMapper";
import { nextCursor, toFetchFailure, toPullRequests, toThrownFailure } from "./githubMapper";

export type SearchResult = {
	readonly pullRequests: readonly PullRequest[];
	readonly issueCount: number;
};

export class FetchError extends Error {
	readonly failure: FetchFailure;

	constructor(failure: FetchFailure) {
		super(failure.message);
		this.name = "FetchError";
		this.failure = failure;
	}
}

const ENDPOINT = "https://api.github.com/graphql";

const SEARCH_QUERY = `
query SearchPullRequests($query: String!, $after: String) {
  search(query: $query, type: ISSUE, first: 50, after: $after) {
    issueCount
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number
        title
        isDraft
        url
        author { login avatarUrl(size: 40) }
        additions
        deletions
        changedFiles
        createdAt
        updatedAt
        repository { nameWithOwner owner { login } }
        latestReviews(first: 20) {
          nodes { author { login avatarUrl(size: 40) } state submittedAt }
        }
        stackEntry { position stack { number size } }
      }
    }
  }
}`;

function parseJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

async function fetchPage(
	token: string,
	query: SearchQuery,
	after: string | null,
	signal: AbortSignal,
): Promise<SearchPage> {
	let status: number;
	let text: string;
	try {
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: SEARCH_QUERY,
				variables: { query, after },
			}),
			signal,
		});
		status = res.status;
		text = await res.text();
	} catch (error) {
		const failure = toThrownFailure(error);
		if (failure === null) {
			throw error;
		}
		throw new FetchError(failure);
	}

	const body = parseJson(text);
	const failure = toFetchFailure(status, body);
	if (failure !== null) {
		throw new FetchError(failure);
	}
	return (body as { data: { search: SearchPage } }).data.search;
}

export async function searchPullRequests(
	token: string,
	query: SearchQuery,
	signal: AbortSignal,
): Promise<SearchResult> {
	const nodes: (SearchNode | null)[] = [];
	let issueCount = 0;
	let after: string | null = null;
	do {
		const page = await fetchPage(token, query, after, signal);
		nodes.push(...(page.nodes ?? []));
		issueCount = page.issueCount;
		after = nextCursor(page, nodes.length);
	} while (after !== null);

	return { pullRequests: toPullRequests(nodes), issueCount };
}
