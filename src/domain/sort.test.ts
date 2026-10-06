import { describe, expect, it } from "vitest";
import type { PullRequest } from "./pullRequest";
import { sortPullRequests } from "./sort";

function pr(number: number, overrides: Partial<PullRequest> = {}): PullRequest {
	return {
		number,
		title: `PR ${number}`,
		url: `https://github.com/acme/repo/pull/${number}`,
		repository: "acme/repo",
		owner: "acme",
		author: { login: `user${number}`, avatarUrl: null },
		diffStat: { additions: 0, deletions: 0, changedFiles: 0 },
		createdAt: "2026-09-01T00:00:00Z",
		updatedAt: "2026-09-01T00:00:00Z",
		latestReviews: [],
		...overrides,
	};
}

const numbers = (prs: readonly PullRequest[]) => prs.map((p) => p.number);

describe("sortPullRequests", () => {
	it("sorts by number asc / desc", () => {
		const prs = [pr(2), pr(10), pr(1)];
		expect(numbers(sortPullRequests(prs, "number", "asc"))).toEqual([1, 2, 10]);
		expect(numbers(sortPullRequests(prs, "number", "desc"))).toEqual([
			10, 2, 1,
		]);
	});

	it('sorts by title with Intl.Collator("en")', () => {
		const prs = [
			pr(1, { title: "beta" }),
			pr(2, { title: "Alpha" }),
			pr(3, { title: "alpha" }),
		];
		expect(numbers(sortPullRequests(prs, "title", "asc"))).toEqual([3, 2, 1]);
	});

	it("sorts by repository", () => {
		const prs = [
			pr(1, { repository: "acme/web" }),
			pr(2, { repository: "acme/api" }),
		];
		expect(numbers(sortPullRequests(prs, "repository", "asc"))).toEqual([2, 1]);
	});

	it("sorts by author login", () => {
		const prs = [
			pr(1, { author: { login: "carol", avatarUrl: null } }),
			pr(2, { author: { login: "bob", avatarUrl: null } }),
		];
		expect(numbers(sortPullRequests(prs, "author", "asc"))).toEqual([2, 1]);
	});

	it('sorts null author as "ghost"', () => {
		const login = (l: string) => ({ login: l, avatarUrl: null });
		const prs = [
			pr(1, { author: login("zoe") }),
			pr(2, { author: null }),
			pr(3, { author: login("alice") }),
		];
		expect(numbers(sortPullRequests(prs, "author", "asc"))).toEqual([3, 2, 1]);
	});

	it("sorts by diff using additions + deletions, ignoring changedFiles", () => {
		const prs = [
			pr(1, { diffStat: { additions: 5, deletions: 5, changedFiles: 1 } }),
			pr(2, { diffStat: { additions: 1, deletions: 2, changedFiles: 50 } }),
			pr(3, { diffStat: { additions: 0, deletions: 20, changedFiles: 1 } }),
		];
		expect(numbers(sortPullRequests(prs, "diff", "asc"))).toEqual([2, 1, 3]);
	});

	it("sorts by createdAt", () => {
		const prs = [
			pr(1, { createdAt: "2026-09-02T00:00:00Z" }),
			pr(2, { createdAt: "2026-09-01T00:00:00Z" }),
		];
		expect(numbers(sortPullRequests(prs, "createdAt", "asc"))).toEqual([2, 1]);
	});

	it("sorts by updatedAt", () => {
		const prs = [
			pr(1, { updatedAt: "2026-09-01T00:00:00Z" }),
			pr(2, { updatedAt: "2026-09-03T00:00:00Z" }),
		];
		expect(numbers(sortPullRequests(prs, "updatedAt", "desc"))).toEqual([2, 1]);
	});

	it("does not mutate the input array", () => {
		const prs = [pr(2), pr(1)];
		sortPullRequests(prs, "number", "asc");
		expect(numbers(prs)).toEqual([2, 1]);
	});

	it("keeps input order for equal keys (stable)", () => {
		const prs = [pr(3), pr(1), pr(2)];
		expect(numbers(sortPullRequests(prs, "createdAt", "asc"))).toEqual([
			3, 1, 2,
		]);
		expect(numbers(sortPullRequests(prs, "createdAt", "desc"))).toEqual([
			3, 1, 2,
		]);
	});
});
