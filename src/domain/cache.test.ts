import { describe, expect, it } from "vitest";
import type { Cache } from "./cache";
import { cacheFor, withCache } from "./cache";
import { createSearchQuery } from "./searchQuery";

const query = createSearchQuery("is:pr author:@me");
const cache: Cache = { query, fetchedAt: "2026-09-28T05:05:00Z", pullRequests: [] };

describe("cacheFor", () => {
	it("returns the cache when its query matches", () => {
		expect(cacheFor(cache, createSearchQuery("is:pr author:@me"))).toBe(cache);
	});

	it("returns null when the query differs", () => {
		expect(cacheFor(cache, createSearchQuery("is:pr"))).toBeNull();
	});

	it("returns null when cache is null", () => {
		expect(cacheFor(null, query)).toBeNull();
	});
});

describe("withCache", () => {
	const at = (q: string, fetchedAt = "2026-09-28T05:05:00Z"): Cache => ({
		query: createSearchQuery(q),
		fetchedAt,
		pullRequests: [],
	});

	it("puts the new cache first", () => {
		expect(withCache([at("a"), at("b")], at("c"), 5).map((c) => c.query)).toEqual(["c", "a", "b"]);
	});

	it("replaces the cache for the same query", () => {
		const fresh = at("b", "2026-09-29T00:00:00Z");
		expect(withCache([at("a"), at("b")], fresh, 5)).toEqual([fresh, at("a")]);
	});

	it("drops the oldest caches beyond the limit", () => {
		expect(withCache([at("a"), at("b")], at("c"), 2).map((c) => c.query)).toEqual(["c", "a"]);
	});
});
