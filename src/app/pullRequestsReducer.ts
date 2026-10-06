import type { Cache } from "../domain/cache";
import type { SearchQuery } from "../domain/searchQuery";
import { SEARCH_LIMIT } from "../domain/searchQuery";
import type { FetchFailure } from "../infra/githubMapper";

export type { FetchFailure };

// requestId is the number of the last issued request. It only increases, even across Idle,
// so a result from an aborted request never matches the current one.
type Common = { readonly query: SearchQuery; readonly requestId: number };

export type PullRequestsState =
	| (Common & { readonly status: "Idle" })
	| (Common & { readonly status: "Fetching" })
	| (Common & {
			readonly status: "Ready";
			readonly cache: Cache;
			readonly issueCount: number;
			readonly truncated: boolean;
	  })
	| (Common & { readonly status: "Error"; readonly error: FetchFailure });

export type PullRequestsEvent =
	| { readonly type: "started"; readonly storedCache: Cache | null }
	| { readonly type: "queryApplied"; readonly query: SearchQuery }
	| {
			readonly type: "fetchSucceeded";
			readonly requestId: number;
			readonly cache: Cache;
			readonly issueCount: number;
	  }
	| {
			readonly type: "fetchFailed";
			readonly requestId: number;
			readonly error: FetchFailure;
	  };

export function initialPullRequestsState(
	query: SearchQuery,
): PullRequestsState {
	return { status: "Idle", query, requestId: 0 };
}

function isInFlight(state: PullRequestsState, requestId: number): boolean {
	return state.status === "Fetching" && state.requestId === requestId;
}

export function pullRequestsReducer(
	state: PullRequestsState,
	event: PullRequestsEvent,
): PullRequestsState {
	const { query, requestId } = state;
	switch (event.type) {
		case "started":
			return state.status === "Idle"
				? { status: "Fetching", query, requestId: requestId + 1 }
				: state;
		case "queryApplied":
			return { status: "Idle", query: event.query, requestId };
		case "fetchSucceeded":
			if (!isInFlight(state, event.requestId)) {
				return state;
			}
			return {
				status: "Ready",
				query,
				requestId,
				cache: event.cache,
				issueCount: event.issueCount,
				truncated: event.issueCount > SEARCH_LIMIT,
			};
		case "fetchFailed":
			if (!isInFlight(state, event.requestId)) {
				return state;
			}
			return { status: "Error", query, requestId, error: event.error };
	}
}
