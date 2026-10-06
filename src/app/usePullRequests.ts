import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from "react";
import { groupPullRequests } from "../domain/group";
import type { PullRequest } from "../domain/pullRequest";
import type { SearchQuery } from "../domain/searchQuery";
import { DEFAULT_QUERY } from "../domain/searchQuery";
import { sortPullRequests } from "../domain/sort";
import type { ViewSettings } from "../domain/viewSettings";
import { FetchError, searchPullRequests } from "../infra/github";
import { loadCache, saveCache } from "../infra/storage";
import { loadQuery, pushQuery } from "../infra/url";
import type { PullRequestsState } from "./pullRequestsReducer";
import { initialPullRequestsState, pullRequestsReducer } from "./pullRequestsReducer";

function listOf(state: PullRequestsState): readonly PullRequest[] | null {
	switch (state.status) {
		case "ShowingCache":
		case "Refreshing":
		case "Ready":
		case "ErrorWithCache":
			return state.cache.pullRequests;
		default:
			return null;
	}
}

export function usePullRequests(token: string | null, viewSettings: ViewSettings) {
	const [state, dispatch] = useReducer(pullRequestsReducer, null, () =>
		initialPullRequestsState(loadQuery() ?? DEFAULT_QUERY),
	);

	// The token is owned by useSettings; this hook only follows its changes.
	const previousToken = useRef(token);
	useLayoutEffect(() => {
		if (previousToken.current === token) {
			return;
		}
		previousToken.current = token;
		dispatch(token === null ? { type: "loggedOut" } : { type: "tokenSaved" });
	}, [token]);

	// Back/forward restores the query of that history entry.
	useEffect(() => {
		const handlePopState = () => dispatch({ type: "queryApplied", query: loadQuery() ?? DEFAULT_QUERY });
		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	// Leave Idle before paint, so Idle is never rendered.
	useLayoutEffect(() => {
		if (state.status === "Idle" && token !== null) {
			dispatch({ type: "started", storedCache: loadCache() });
		}
	}, [state.status, token]);

	// Background refresh right after showing the cache (FR-CACHE-3).
	useEffect(() => {
		if (state.status === "ShowingCache") {
			dispatch({ type: "refreshRequested" });
		}
	}, [state.status]);

	// Keyed by the in-flight request and the token: leaving the in-flight state for any reason
	// (query applied, logout, new request) runs the cleanup and aborts the old request.
	const inFlightId = state.status === "Fetching" || state.status === "Refreshing" ? state.requestId : null;
	const { query } = state;
	useEffect(() => {
		if (inFlightId === null || token === null) {
			return;
		}
		const controller = new AbortController();
		searchPullRequests(token, query, controller.signal).then(
			({ pullRequests, issueCount }) => {
				// An aborted request (e.g. logout) must not write back the cache it just cleared.
				if (controller.signal.aborted) {
					return;
				}
				const cache = {
					query,
					fetchedAt: new Date().toISOString(),
					pullRequests,
				};
				saveCache(cache);
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
		pushQuery(next);
		dispatch({ type: "queryApplied", query: next });
	}, []);

	const refresh = useCallback(() => dispatch({ type: "refreshRequested" }), []);

	const pullRequests = listOf(state);
	const { grouping, sortKey, sortDirection } = viewSettings;
	const groups = useMemo(
		() =>
			pullRequests === null
				? null
				: groupPullRequests(sortPullRequests(pullRequests, sortKey, sortDirection), grouping),
		[pullRequests, grouping, sortKey, sortDirection],
	);

	return { state, pullRequests, groups, applyQuery, refresh };
}
