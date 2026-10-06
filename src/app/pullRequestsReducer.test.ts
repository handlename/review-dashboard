import { describe, expect, it } from "vitest";
import type { Cache } from "../domain/cache";
import { createSearchQuery } from "../domain/searchQuery";
import type { FetchFailure, PullRequestsEvent, PullRequestsState } from "./pullRequestsReducer";
import { initialPullRequestsState, pullRequestsReducer } from "./pullRequestsReducer";

const queryA = createSearchQuery("is:pr author:@me");
const queryB = createSearchQuery("is:pr review-requested:@me");

const cacheOf = (query = queryA): Cache => ({
	query,
	fetchedAt: "2026-09-28T05:05:00Z",
	pullRequests: [],
});

const networkError: FetchFailure = {
	kind: "Network",
	message: "Failed to fetch",
};

function run(
	state: PullRequestsState,
	...events: PullRequestsEvent[]
): PullRequestsState {
	return events.reduce(pullRequestsReducer, state);
}

const idle = initialPullRequestsState(queryA);
const fetching = run(idle, { type: "started", storedCache: null });
const succeeded = (
	state: PullRequestsState,
	issueCount = 0,
): PullRequestsEvent => ({
	type: "fetchSucceeded",
	requestId: state.requestId,
	cache: cacheOf(state.query),
	issueCount,
});
const failed = (
	state: PullRequestsState,
	error = networkError,
): PullRequestsEvent => ({
	type: "fetchFailed",
	requestId: state.requestId,
	error,
});
const ready = run(fetching, succeeded(fetching));
const error = run(fetching, failed(fetching));

describe("pullRequestsReducer", () => {
	it("[*] → Idle: initial state is Idle with the given query and requestId 0", () => {
		expect(idle).toEqual({ status: "Idle", query: queryA, requestId: 0 });
	});

	it("Idle → Fetching: started with storedCache null", () => {
		expect(fetching).toEqual({
			status: "Fetching",
			query: queryA,
			requestId: 1,
		});
	});

	it("Fetching → Ready: fetchSucceeded stores cache and issueCount", () => {
		const next = run(fetching, succeeded(fetching, 3));
		expect(next).toEqual({
			status: "Ready",
			query: queryA,
			requestId: 1,
			cache: cacheOf(),
			issueCount: 3,
			truncated: false,
		});
	});

	it("Ready.truncated is false when issueCount <= SEARCH_LIMIT and true when it is greater", () => {
		expect(run(fetching, succeeded(fetching, 1000))).toMatchObject({
			truncated: false,
		});
		expect(run(fetching, succeeded(fetching, 1001))).toMatchObject({
			truncated: true,
		});
	});

	it("Fetching → Error: fetchFailed stores the failure", () => {
		expect(error).toEqual({
			status: "Error",
			query: queryA,
			requestId: 1,
			error: networkError,
		});
	});


	it.each([
		["Idle", idle],
		["Fetching", fetching],
		["Ready", ready],
		["Error", error],
	])("queryApplied from %s returns Idle with the new query", (_, state) => {
		expect(run(state, { type: "queryApplied", query: queryB })).toEqual({
			status: "Idle",
			query: queryB,
			requestId: state.requestId,
		});
	});

	it("requestId increments when entering Fetching", () => {
		expect(fetching.requestId).toBe(idle.requestId + 1);
	});

	it("requestId is carried through Idle after queryApplied", () => {
		expect(
			run(fetching, { type: "queryApplied", query: queryB }).requestId,
		).toBe(fetching.requestId);
	});

	it("requestId after queryApplied → started differs from the aborted one", () => {
		const next = run(
			fetching,
			{ type: "queryApplied", query: queryB },
			{ type: "started", storedCache: null },
		);
		expect(next.status).toBe("Fetching");
		expect(next.requestId).not.toBe(fetching.requestId);
	});

	it("fetchSucceeded with a stale requestId is ignored", () => {
		const next = run(
			fetching,
			{ type: "queryApplied", query: queryB },
			{ type: "started", storedCache: null },
		);
		expect(run(next, succeeded(fetching))).toBe(next);
	});

	it("fetchFailed with a stale requestId is ignored", () => {
		const next = run(
			fetching,
			{ type: "queryApplied", query: queryB },
			{ type: "started", storedCache: null },
		);
		expect(run(next, failed(fetching))).toBe(next);
	});

	it("fetchSucceeded outside Fetching is ignored", () => {
		expect(run(ready, succeeded(ready))).toBe(ready);
		expect(run(idle, succeeded(idle))).toBe(idle);
	});

	it("started outside Idle returns the same state", () => {
		for (const state of [fetching, ready, error]) {
			expect(run(state, { type: "started", storedCache: null })).toBe(state);
		}
	});
});

describe("pullRequestsReducer: cache states", () => {
	const started = (state: PullRequestsState, storedCache: Cache | null): PullRequestsState =>
		run(state, { type: "started", storedCache });
	const refresh: PullRequestsEvent = { type: "refreshRequested" };
	const showingCache = started(idle, cacheOf(queryA));
	const refreshing = run(showingCache, refresh);
	const errorWithCache = run(refreshing, failed(refreshing));

	it("Idle → ShowingCache: started with a cache for the current query", () => {
		expect(showingCache).toEqual({ status: "ShowingCache", query: queryA, requestId: 0, cache: cacheOf(queryA) });
	});

	it("Idle → Fetching: started with a cache for another query (FR-CACHE-6)", () => {
		expect(started(idle, cacheOf(queryB))).toEqual({ status: "Fetching", query: queryA, requestId: 1 });
	});

	it("ShowingCache → Refreshing: refreshRequested (background refresh)", () => {
		expect(refreshing).toEqual({ status: "Refreshing", query: queryA, requestId: 1, cache: cacheOf(queryA) });
	});

	it("Refreshing → Ready: fetchSucceeded replaces the cache", () => {
		const fresh: Cache = { ...cacheOf(queryA), fetchedAt: "2026-09-29T00:00:00Z" };
		const next = run(refreshing, { type: "fetchSucceeded", requestId: refreshing.requestId, cache: fresh, issueCount: 0 });
		expect(next).toMatchObject({ status: "Ready", cache: fresh });
	});

	it("Refreshing → ErrorWithCache: fetchFailed keeps the cache", () => {
		expect(errorWithCache).toEqual({
			status: "ErrorWithCache",
			query: queryA,
			requestId: 1,
			cache: cacheOf(queryA),
			error: networkError,
		});
	});


	it("Ready → Refreshing: refreshRequested (manual refresh)", () => {
		expect(run(ready, refresh)).toEqual({ status: "Refreshing", query: queryA, requestId: 2, cache: cacheOf(queryA) });
	});

	it("ErrorWithCache → Refreshing: refreshRequested", () => {
		expect(run(errorWithCache, refresh)).toMatchObject({ status: "Refreshing", requestId: 2, cache: cacheOf(queryA) });
	});

	it("Error → Fetching: refreshRequested", () => {
		expect(run(error, refresh)).toEqual({ status: "Fetching", query: queryA, requestId: 2 });
	});

	it("refreshRequested in Idle / Fetching / Refreshing returns the same state", () => {
		for (const state of [idle, fetching, refreshing]) {
			expect(run(state, refresh)).toBe(state);
		}
	});

	it("requestId increments when entering Refreshing", () => {
		expect(refreshing.requestId).toBe(showingCache.requestId + 1);
	});

	it.each([
		["ShowingCache", showingCache],
		["Refreshing", refreshing],
		["ErrorWithCache", errorWithCache],
	])("queryApplied from %s returns Idle with the new query", (_, state) => {
		expect(run(state, { type: "queryApplied", query: queryB })).toEqual({
			status: "Idle",
			query: queryB,
			requestId: state.requestId,
		});
	});

	it("stale fetchSucceeded during Refreshing is ignored", () => {
		const again = run(refreshing, failed(refreshing), refresh);
		expect(run(again, succeeded(refreshing))).toBe(again);
	});

	it("ShowingCache and ErrorWithCache carry no issueCount; Ready carries issueCount and truncated", () => {
		expect(showingCache).not.toHaveProperty("issueCount");
		expect(errorWithCache).not.toHaveProperty("issueCount");
		expect(run(refreshing, succeeded(refreshing, 1500))).toMatchObject({ issueCount: 1500, truncated: true });
	});
});

describe("pullRequestsReducer: unauthorized and logout", () => {
	const unauthorizedError: FetchFailure = { kind: "Unauthorized", message: "Bad credentials" };
	const showingCache = run(idle, { type: "started", storedCache: cacheOf(queryA) });
	const refreshing = run(showingCache, { type: "refreshRequested" });
	const errorWithCache = run(refreshing, failed(refreshing));
	const unauthorized = run(fetching, failed(fetching, unauthorizedError));

	it("Fetching → Unauthorized: fetchFailed with kind Unauthorized", () => {
		expect(unauthorized).toEqual({ status: "Unauthorized", query: queryA, requestId: 1 });
	});

	it("Refreshing → Unauthorized: fetchFailed with kind Unauthorized", () => {
		expect(run(refreshing, failed(refreshing, unauthorizedError))).toEqual({
			status: "Unauthorized",
			query: queryA,
			requestId: 1,
		});
	});

	it("Unauthorized → Idle: tokenSaved", () => {
		expect(run(unauthorized, { type: "tokenSaved" })).toEqual({ status: "Idle", query: queryA, requestId: 1 });
	});

	it("Unauthorized → Idle → ShowingCache: started with the stored cache after tokenSaved", () => {
		const next = run(unauthorized, { type: "tokenSaved" }, { type: "started", storedCache: cacheOf(queryA) });
		expect(next).toMatchObject({ status: "ShowingCache", cache: cacheOf(queryA) });
	});

	it("stale fetchFailed with kind Unauthorized is ignored", () => {
		const next = run(fetching, { type: "queryApplied", query: queryB }, { type: "started", storedCache: null });
		expect(run(next, failed(fetching, unauthorizedError))).toBe(next);
	});

	it.each([
		["Idle", idle],
		["ShowingCache", showingCache],
		["Refreshing", refreshing],
		["Ready", ready],
		["ErrorWithCache", errorWithCache],
		["Fetching", fetching],
		["Error", error],
		["Unauthorized", unauthorized],
	])("loggedOut from %s returns Idle", (_, state) => {
		expect(run(state, { type: "loggedOut" })).toEqual({ status: "Idle", query: state.query, requestId: state.requestId });
	});

	it("requestId after loggedOut → started differs from the previous one", () => {
		const next = run(fetching, { type: "loggedOut" }, { type: "started", storedCache: null });
		expect(next.status).toBe("Fetching");
		expect(next.requestId).not.toBe(fetching.requestId);
	});

	it("queryApplied from Unauthorized returns Idle with the new query", () => {
		expect(run(unauthorized, { type: "queryApplied", query: queryB })).toEqual({
			status: "Idle",
			query: queryB,
			requestId: unauthorized.requestId,
		});
	});

	it("tokenSaved in states other than Unauthorized returns the same state", () => {
		for (const state of [idle, showingCache, refreshing, ready, errorWithCache, fetching, error]) {
			expect(run(state, { type: "tokenSaved" })).toBe(state);
		}
	});
});
