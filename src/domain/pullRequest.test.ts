import { describe, expect, it } from "vitest";
import type { Actor, Review } from "./pullRequest";
import { respondedReviews } from "./pullRequest";

const actor = (login: string): Actor => ({ login, avatarUrl: null });

const review = (login: string | null, submittedAt: string): Review => ({
	reviewer: login === null ? null : actor(login),
	state: "COMMENTED",
	submittedAt,
});

const logins = (reviews: readonly Review[]) =>
	reviews.map((r) => r.reviewer?.login ?? null);

describe("respondedReviews", () => {
	it("drops the review of a re-requested reviewer and keeps the others", () => {
		const reviews = [
			review("alice", "2026-09-28T00:00:00Z"),
			review("bob", "2026-09-28T01:00:00Z"),
		];
		expect(logins(respondedReviews(reviews, [actor("bob")]))).toEqual([
			"alice",
		]);
	});

	it("keeps reviews of deleted users (null reviewer)", () => {
		const reviews = [review(null, "2026-09-28T00:00:00Z")];
		expect(logins(respondedReviews(reviews, [actor("bob")]))).toEqual([null]);
	});

	it("does not hide reviews of team members when a team is requested", () => {
		const reviews = [review("alice", "2026-09-28T00:00:00Z")];
		expect(logins(respondedReviews(reviews, [actor("acme/web")]))).toEqual([
			"alice",
		]);
	});

	it("sorts by submittedAt ascending", () => {
		const reviews = [
			review("bob", "2026-09-28T02:00:00Z"),
			review("alice", "2026-09-28T01:00:00Z"),
		];
		expect(logins(respondedReviews(reviews, []))).toEqual(["alice", "bob"]);
	});
});
