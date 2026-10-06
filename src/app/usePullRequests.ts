import { useCallback, useEffect, useLayoutEffect, useReducer } from "react";
import type { PullRequest } from "../domain/pullRequest";
import type { SearchQuery } from "../domain/searchQuery";
import { DEFAULT_QUERY } from "../domain/searchQuery";
import { FetchError, searchPullRequests } from "../infra/github";
import { loadQuery, saveQuery } from "../infra/storage";
import type { PullRequestsState } from "./pullRequestsReducer";
import { initialPullRequestsState, pullRequestsReducer } from "./pullRequestsReducer";

function listOf(state: PullRequestsState): readonly PullRequest[] | null {
	switch (state.status) {
		case "Ready":
			return state.cache.pullRequests;
		default:
			return null;
	}
}

export function usePullRequests(token: string | null) {
	const [state, dispatch] = useReducer(pullRequestsReducer, null, () =>
		initialPullRequestsState(loadQuery() ?? DEFAULT_QUERY),
	);

	// Leave Idle before paint, so Idle is never rendered.
	useLayoutEffect(() => {
		if (state.status === "Idle" && token !== null) {
			dispatch({ type: "started", storedCache: null });
		}
	}, [state.status, token]);

	// Keyed by the in-flight request and the token: leaving the in-flight state for any reason
	// (query applied, logout, new request) runs the cleanup and aborts the old request.
	const inFlightId = state.status === "Fetching" ? state.requestId : null;
	const { query } = state;
	useEffect(() => {
		if (inFlightId === null || token === null) {
			return;
		}
		const controller = new AbortController();
		searchPullRequests(token, query, controller.signal).then(
			({ pullRequests, issueCount }) => {
				if (controller.signal.aborted) {
					return;
				}
				const cache = {
					query,
					fetchedAt: new Date().toISOString(),
					pullRequests,
				};
				dispatch({
					type: "fetchSucceeded",
					requestId: inFlightId,
					cache,
					issueCount,
				});
			},
			(error: unknown) => {
				if (controller.signal.aborted) {
					return;
				}
				const failure =
					error instanceof FetchError
						? error.failure
						: {
								kind: "Other" as const,
								message: error instanceof Error ? error.message : String(error),
							};
				dispatch({
					type: "fetchFailed",
					requestId: inFlightId,
					error: failure,
				});
			},
		);
		return () => controller.abort();
	}, [inFlightId, token, query]);

	const applyQuery = useCallback((next: SearchQuery) => {
		saveQuery(next);
		dispatch({ type: "queryApplied", query: next });
	}, []);

	return { state, pullRequests: listOf(state), applyQuery };
}
