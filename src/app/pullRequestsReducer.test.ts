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

	it("Fetching → Error: fetchFailed with kind Unauthorized (until T4.1)", () => {
		const unauthorized: FetchFailure = {
			kind: "Unauthorized",
			message: "Bad credentials",
		};
		expect(run(fetching, failed(fetching, unauthorized))).toMatchObject({
			status: "Error",
			error: unauthorized,
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
