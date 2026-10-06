import { useEffect } from "react";
import type { AutoRefreshMinutes } from "../domain/viewSettings";
import { scheduleAutoRefresh, shouldAutoRefresh } from "./autoRefresh";
import type { PullRequestsState } from "./pullRequestsReducer";

export type AutoRefreshTimer = {
	// Changes whenever the timer restarts, so a progress bar keyed by it restarts together.
	readonly key: string;
	readonly minutes: number;
};

// requestId changes on every request, so the timer restarts each time a request settles,
// as well as when the interval changes.
export function useAutoRefresh(
	state: PullRequestsState,
	minutes: AutoRefreshMinutes,
	refresh: () => void,
): AutoRefreshTimer | null {
	const { status, requestId } = state;
	useEffect(() => scheduleAutoRefresh(state, minutes, refresh) ?? undefined, [status, requestId, minutes]);
	return minutes > 0 && shouldAutoRefresh(state)
		? { key: `${requestId}-${status}-${minutes}`, minutes }
		: null;
}
