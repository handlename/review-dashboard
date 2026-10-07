import { describe, expect, it } from "vitest";
import type { SearchNode, SearchPage } from "./githubMapper";
import { nextCursor, toFetchFailure, toPullRequests, toThrownFailure } from "./githubMapper";

const avatar = (login: string) =>
	`https://avatars.githubusercontent.com/u/${login}?v=4`;

function prNode(overrides: Record<string, unknown> = {}): SearchNode {
	return {
		number: 123,
		title: "Fix pagination bug",
		isDraft: false,
		url: "https://github.com/handlename/review-dashboard/pull/123",
		author: { login: "alice", avatarUrl: avatar("alice") },
		additions: 120,
		deletions: 30,
		changedFiles: 4,
		createdAt: "2026-09-27T01:02:00Z",
		updatedAt: "2026-09-28T05:05:00Z",
		repository: {
			nameWithOwner: "handlename/review-dashboard",
			owner: { login: "handlename" },
		},
		latestReviews: { nodes: [] },
		stackEntry: null,
		...overrides,
	} as SearchNode;
}

const review = (
	login: string | null,
	state: string,
	submittedAt = "2026-09-28T00:00:00Z",
) => ({
	author: login === null ? null : { login, avatarUrl: avatar(login) },
	state,
	submittedAt,
});

function page(
	hasNextPage: boolean,
	endCursor: string | null = "cursor",
): SearchPage {
	return { issueCount: 0, pageInfo: { hasNextPage, endCursor }, nodes: [] };
}

describe("toPullRequests", () => {
	it("drops non-PullRequest (issue) nodes", () => {
		expect(toPullRequests([prNode(), {}])).toHaveLength(1);
	});

	it("drops duplicate pull requests that appear on two pages", () => {
		expect(toPullRequests([prNode(), prNode()])).toHaveLength(1);
	});

	it("maps null latestReviews to no reviews", () => {
		const [pr] = toPullRequests([prNode({ latestReviews: null })]);
		expect(pr.latestReviews).toEqual([]);
	});

	it("drops null nodes", () => {
		expect(toPullRequests([null, prNode()])).toHaveLength(1);
	});

	it("drops PENDING reviews and keeps APPROVED / CHANGES_REQUESTED / COMMENTED / DISMISSED", () => {
		const nodes = [
			"PENDING",
			"APPROVED",
			"CHANGES_REQUESTED",
			"COMMENTED",
			"DISMISSED",
		].map((s, i) => review(`r${i}`, s));
		const [pr] = toPullRequests([prNode({ latestReviews: { nodes } })]);
		expect(pr.latestReviews.map((r) => r.state)).toEqual([
			"APPROVED",
			"CHANGES_REQUESTED",
			"COMMENTED",
			"DISMISSED",
		]);
	});

	it("maps isDraft", () => {
		const [pr] = toPullRequests([prNode({ isDraft: true })]);
		expect(pr.isDraft).toBe(true);
	});

	it("maps stackEntry to stack", () => {
		const [pr] = toPullRequests([
			prNode({ stackEntry: { position: 2, stack: { number: 20, size: 3 } } }),
		]);
		expect(pr.stack).toEqual({ number: 20, position: 2, size: 3 });
	});

	it("maps null stackEntry to null", () => {
		const [pr] = toPullRequests([prNode()]);
		expect(pr.stack).toBeNull();
	});

	it("maps stackEntry without stack to null", () => {
		const [pr] = toPullRequests([prNode({ stackEntry: { position: 1, stack: null } })]);
		expect(pr.stack).toBeNull();
	});

	it("maps null author to null", () => {
		const [pr] = toPullRequests([prNode({ author: null })]);
		expect(pr.author).toBeNull();
	});

	it("maps null reviewer to null", () => {
		const [pr] = toPullRequests([
			prNode({ latestReviews: { nodes: [review(null, "APPROVED")] } }),
		]);
		expect(pr.latestReviews[0].reviewer).toBeNull();
	});

	it("converts avatarUrl on another host to null", () => {
		const [pr] = toPullRequests([
			prNode({
				author: { login: "alice", avatarUrl: "https://example.com/a.png" },
			}),
		]);
		expect(pr.author).toEqual({ login: "alice", avatarUrl: null });
	});

	it("converts avatarUrl on a lookalike host (avatars.githubusercontent.com.example.com) to null", () => {
		const url = "https://avatars.githubusercontent.com.example.com/u/1";
		const [pr] = toPullRequests([
			prNode({ author: { login: "alice", avatarUrl: url } }),
		]);
		expect(pr.author?.avatarUrl).toBeNull();
	});

	it("keeps avatarUrl on https://avatars.githubusercontent.com/", () => {
		const [pr] = toPullRequests([prNode()]);
		expect(pr.author?.avatarUrl).toBe(avatar("alice"));
	});

	it("maps repository.nameWithOwner to repository and repository.owner.login to owner", () => {
		const [pr] = toPullRequests([prNode()]);
		expect(pr.repository).toBe("handlename/review-dashboard");
		expect(pr.owner).toBe("handlename");
	});

	it("maps additions / deletions / changedFiles to diffStat", () => {
		const [pr] = toPullRequests([prNode()]);
		expect(pr.diffStat).toEqual({
			additions: 120,
			deletions: 30,
			changedFiles: 4,
		});
	});
});

describe("toFetchFailure", () => {
	const ok = { data: { search: page(false) } };

	it("toFetchFailure returns null for 200 with data and no errors", () => {
		expect(toFetchFailure(200, ok)).toBeNull();
	});

	it("toFetchFailure maps 401 to Unauthorized", () => {
		expect(toFetchFailure(401, { message: "Bad credentials" })).toEqual({
			kind: "Unauthorized",
			message: "Bad credentials",
		});
	});

	it("toFetchFailure maps 403 to RateLimit", () => {
		expect(
			toFetchFailure(403, { message: "API rate limit exceeded" })?.kind,
		).toBe("RateLimit");
	});

	it("toFetchFailure maps 429 to RateLimit", () => {
		expect(toFetchFailure(429, undefined)?.kind).toBe("RateLimit");
	});

	it("toFetchFailure maps 502 to Other", () => {
		expect(toFetchFailure(502, undefined)).toEqual({
			kind: "Other",
			message: "HTTP 502",
		});
	});

	it("toFetchFailure maps a non-JSON body (undefined) to Other", () => {
		expect(toFetchFailure(200, undefined)?.kind).toBe("Other");
	});

	it("toFetchFailure maps GraphQL error type RATE_LIMITED to RateLimit", () => {
		const body = {
			errors: [{ type: "RATE_LIMITED", message: "API rate limit exceeded" }],
		};
		expect(toFetchFailure(200, body)).toEqual({
			kind: "RateLimit",
			message: "API rate limit exceeded",
		});
	});

	it("toFetchFailure maps another GraphQL error to Other with its message", () => {
		const body = {
			errors: [{ type: "INVALID_QUERY", message: "Invalid search query" }],
		};
		expect(toFetchFailure(200, body)).toEqual({
			kind: "Other",
			message: "Invalid search query",
		});
	});

	it("toFetchFailure treats data.search with a FORBIDDEN error as success (D-5 default)", () => {
		const body = {
			...ok,
			errors: [{ type: "FORBIDDEN", message: "SAML enforcement" }],
		};
		expect(toFetchFailure(200, body)).toBeNull();
	});

	it("toFetchFailure maps RATE_LIMITED to RateLimit even when data.search exists", () => {
		const body = {
			...ok,
			errors: [{ type: "RATE_LIMITED", message: "limit" }],
		};
		expect(toFetchFailure(200, body)?.kind).toBe("RateLimit");
	});

	it("toFetchFailure maps errors without data.search to Other", () => {
		const body = { data: null, errors: [{ message: "Something went wrong" }] };
		expect(toFetchFailure(200, body)).toEqual({
			kind: "Other",
			message: "Something went wrong",
		});
	});

	it("toFetchFailure maps an object with neither data.search nor errors to Other", () => {
		expect(toFetchFailure(200, {})).toEqual({
			kind: "Other",
			message: "Unexpected response",
		});
	});
});

describe("toThrownFailure", () => {
	it("toThrownFailure maps TypeError to Network", () => {
		expect(toThrownFailure(new TypeError("Failed to fetch"))?.kind).toBe(
			"Network",
		);
	});

	it("toThrownFailure returns null for AbortError", () => {
		expect(
			toThrownFailure(new DOMException("aborted", "AbortError")),
		).toBeNull();
	});

	it("toThrownFailure maps any other value to Other", () => {
		expect(toThrownFailure(new Error("boom"))).toEqual({
			kind: "Other",
			message: "boom",
		});
		expect(toThrownFailure("boom")).toEqual({ kind: "Other", message: "boom" });
	});
});

describe("nextCursor", () => {
	it("nextCursor returns endCursor while hasNextPage is true and under the limit", () => {
		expect(nextCursor(page(true, "abc"), 950)).toBe("abc");
	});

	it("nextCursor returns null when hasNextPage is false", () => {
		expect(nextCursor(page(false, "abc"), 50)).toBeNull();
	});

	it("nextCursor returns null at 1,000 fetched nodes even if hasNextPage is true", () => {
		expect(nextCursor(page(true, "abc"), 1000)).toBeNull();
	});
});
