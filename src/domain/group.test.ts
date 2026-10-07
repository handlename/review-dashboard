import { describe, expect, it } from "vitest";
import { groupPullRequests } from "./group";
import type { PullRequest } from "./pullRequest";

function pr(number: number, repository: string): PullRequest {
	return {
		number,
		title: `PR ${number}`,
		isDraft: false,
		url: `https://github.com/${repository}/pull/${number}`,
		repository,
		owner: repository.split("/")[0],
		author: null,
		diffStat: { additions: 0, deletions: 0, changedFiles: 0 },
		createdAt: "2026-09-01T00:00:00Z",
		updatedAt: "2026-09-01T00:00:00Z",
		latestReviews: [],
		stack: null,
	};
}

const prs = [
	pr(1, "zeta/web"),
	pr(2, "acme/web"),
	pr(3, "acme/api"),
	pr(4, "zeta/web"),
	pr(5, "acme/web"),
];

const summary = (groups: ReturnType<typeof groupPullRequests>) =>
	groups.map((g) => [g.name, g.pullRequests.map((p) => p.number)]);

describe("groupPullRequests", () => {
	it("none returns a single group containing all pull requests in order", () => {
		expect(summary(groupPullRequests(prs, "none"))).toEqual([
			["", [1, 2, 3, 4, 5]],
		]);
	});

	it("owner groups by owner login", () => {
		expect(summary(groupPullRequests(prs, "owner"))).toEqual([
			["acme", [2, 3, 5]],
			["zeta", [1, 4]],
		]);
	});

	it("repository groups by nameWithOwner", () => {
		expect(summary(groupPullRequests(prs, "repository"))).toEqual([
			["acme/api", [3]],
			["acme/web", [2, 5]],
			["zeta/web", [1, 4]],
		]);
	});

	it("groups are ordered by name ascending", () => {
		const names = groupPullRequests(
			[pr(1, "b/x"), pr(2, "C/x"), pr(3, "a/x")],
			"owner",
		).map((g) => g.name);
		expect(names).toEqual(["a", "b", "C"]);
	});

	it("order within each group follows input order", () => {
		const reversed = [...prs].reverse();
		expect(summary(groupPullRequests(reversed, "owner"))).toEqual([
			["acme", [5, 3, 2]],
			["zeta", [4, 1]],
		]);
	});

	it("empty input returns no groups for owner / repository", () => {
		expect(groupPullRequests([], "owner")).toEqual([]);
		expect(groupPullRequests([], "repository")).toEqual([]);
	});
});
