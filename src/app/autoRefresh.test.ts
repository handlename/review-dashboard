import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Cache } from "../domain/cache";
import { createSearchQuery } from "../domain/searchQuery";
import { scheduleAutoRefresh, shouldAutoRefresh } from "./autoRefresh";
import type { FetchFailure, PullRequestsState } from "./pullRequestsReducer";

const query = createSearchQuery("is:pr author:@me");
const cache: Cache = { query, fetchedAt: "2026-10-07T11:50:00Z", pullRequests: [] };
const failure = (kind: FetchFailure["kind"]): FetchFailure => ({ kind, message: kind });

const states: Record<string, PullRequestsState> = {
	Idle: { status: "Idle", query, requestId: 1 },
	ShowingCache: { status: "ShowingCache", query, requestId: 1, cache },
	Refreshing: { status: "Refreshing", query, requestId: 1, cache },
	Fetching: { status: "Fetching", query, requestId: 1 },
	Ready: { status: "Ready", query, requestId: 1, cache, issueCount: 0, truncated: false },
	Unauthorized: { status: "Unauthorized", query, requestId: 1 },
};
const errorWithCache = (kind: FetchFailure["kind"]): PullRequestsState => ({
	status: "ErrorWithCache",
	query,
	requestId: 1,
	cache,
	error: failure(kind),
});
const error = (kind: FetchFailure["kind"]): PullRequestsState => ({
	status: "Error",
	query,
	requestId: 1,
	error: failure(kind),
});

describe("shouldAutoRefresh", () => {
	it.each([
		["Ready", states.Ready, true],
		["Idle", states.Idle, false],
		["ShowingCache", states.ShowingCache, false],
		["Refreshing", states.Refreshing, false],
		["Fetching", states.Fetching, false],
		["Unauthorized", states.Unauthorized, false],
		["ErrorWithCache Network", errorWithCache("Network"), true],
		["ErrorWithCache Other", errorWithCache("Other"), true],
		["ErrorWithCache RateLimit", errorWithCache("RateLimit"), false],
		["ErrorWithCache Unauthorized", errorWithCache("Unauthorized"), false],
		["Error Network", error("Network"), true],
		["Error Other", error("Other"), true],
		["Error RateLimit", error("RateLimit"), false],
	])("%s → %s", (_, state, expected) => {
		expect(shouldAutoRefresh(state)).toBe(expected);
	});
});

describe("scheduleAutoRefresh", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Ten minutes after cache.fetchedAt.
		vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it.each([
		["ErrorWithCache Network", errorWithCache("Network")],
		["Error Other", error("Other")],
		["Ready", states.Ready],
	])("%s refreshes once after the full interval, even when the cache is older than the interval", (_, state) => {
		const refresh = vi.fn();
		scheduleAutoRefresh(state, 5, refresh);
		vi.advanceTimersByTime(5 * 60_000 - 1);
		expect(refresh).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(refresh).toHaveBeenCalledTimes(1);
	});

	it.each([
		["minutes 0", states.Ready, 0],
		["RateLimit", errorWithCache("RateLimit"), 5],
		["Refreshing", states.Refreshing, 5],
	])("returns null and never refreshes for %s", (_, state, minutes) => {
		const refresh = vi.fn();
		expect(scheduleAutoRefresh(state, minutes, refresh)).toBeNull();
		vi.advanceTimersByTime(60 * 60_000);
		expect(refresh).not.toHaveBeenCalled();
	});

	it("the returned function cancels the timer", () => {
		const refresh = vi.fn();
		scheduleAutoRefresh(states.Ready, 1, refresh)?.();
		vi.advanceTimersByTime(60_000);
		expect(refresh).not.toHaveBeenCalled();
	});
});
