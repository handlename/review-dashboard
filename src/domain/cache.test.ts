import { describe, expect, it } from "vitest";
import type { Cache } from "./cache";
import { cacheFor } from "./cache";
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
