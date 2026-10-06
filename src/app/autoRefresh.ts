import type { PullRequestsState } from "./pullRequestsReducer";

// Auto refresh stops on errors that retrying cannot fix soon, and while a request is in flight.
export function shouldAutoRefresh(state: PullRequestsState): boolean {
	switch (state.status) {
		case "Ready":
			return true;
		case "ErrorWithCache":
		case "Error":
			return state.error.kind === "Network" || state.error.kind === "Other";
		default:
			return false;
	}
}

// The interval counts from the call, not from cache.fetchedAt: ErrorWithCache keeps the cache of the
// last success, so counting from it would retry immediately after every failure.
export function scheduleAutoRefresh(
	state: PullRequestsState,
	minutes: number,
	refresh: () => void,
): (() => void) | null {
	if (minutes === 0 || !shouldAutoRefresh(state)) {
		return null;
	}
	const id = setTimeout(refresh, minutes * 60_000);
	return () => clearTimeout(id);
}
