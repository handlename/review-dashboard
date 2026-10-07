import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchQuery } from "../domain/searchQuery";
import type { Cache } from "../domain/cache";
import { DEFAULT_VIEW_SETTINGS } from "../domain/viewSettings";
import { clearSession, loadCache, loadToken, loadViewSettings, saveCache, saveToken, saveViewSettings } from "./storage";

function fakeStorage(): Storage {
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (key) => map.get(key) ?? null,
		key: (index) => [...map.keys()][index] ?? null,
		removeItem: (key) => void map.delete(key),
		setItem: (key, value) => void map.set(key, String(value)),
	};
}

function throwingStorage(): Storage {
	const fail = () => {
		throw new DOMException("denied", "SecurityError");
	};
	return {
		length: 0,
		clear: fail,
		getItem: fail,
		key: fail,
		removeItem: fail,
		setItem: fail,
	};
}

beforeEach(() => {
	vi.unstubAllGlobals();
	vi.stubGlobal("localStorage", fakeStorage());
});

describe("storage: token", () => {
	it("saveToken then loadToken returns the token", () => {
		saveToken("ghp_example");
		expect(loadToken()).toBe("ghp_example");
	});

	it("ignores keys without the review-dashboard:v1: prefix (old format)", () => {
		localStorage.setItem("token", "ghp_old");
		expect(loadToken()).toBeNull();
	});

	it("load* returns null when localStorage access throws", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(loadToken()).toBeNull();
	});

	it("save* does not throw when setItem throws (quota exceeded)", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(() => saveToken("ghp_example")).not.toThrow();
	});
});

describe("storage: view settings", () => {
	it("saveViewSettings then loadViewSettings round-trips", () => {
		const settings = {
			grouping: "repository",
			sortKey: "diff",
			sortDirection: "asc",
			relativeTime: true,
			autoRefreshMinutes: 5,
		} as const;
		saveViewSettings(settings);
		expect(loadViewSettings()).toEqual(settings);
	});

	it("loadViewSettings accepts the owner sort key", () => {
		const settings = { ...DEFAULT_VIEW_SETTINGS, sortKey: "owner" } as const;
		saveViewSettings(settings);
		expect(loadViewSettings()).toEqual(settings);
	});

	it("loadViewSettings returns null for invalid JSON", () => {
		localStorage.setItem("review-dashboard:v1:view", "{not json");
		expect(loadViewSettings()).toBeNull();
	});

	it.each([
		{ grouping: "org", sortKey: "diff", sortDirection: "asc" },
		{ grouping: "none", sortKey: "reviews", sortDirection: "asc" },
		{ grouping: "none", sortKey: "diff", sortDirection: "up" },
	])("loadViewSettings returns null for an unknown grouping / sortKey / sortDirection value (old format) %#", (value) => {
		localStorage.setItem("review-dashboard:v1:view", JSON.stringify(value));
		expect(loadViewSettings()).toBeNull();
	});

	it("loadViewSettings keeps grouping and sort and fills defaults for settings saved before relativeTime / autoRefreshMinutes", () => {
		localStorage.setItem(
			"review-dashboard:v1:view",
			JSON.stringify({ grouping: "owner", sortKey: "title", sortDirection: "asc" }),
		);
		expect(loadViewSettings()).toEqual({
			grouping: "owner",
			sortKey: "title",
			sortDirection: "asc",
			relativeTime: false,
			autoRefreshMinutes: 0,
		});
	});

	it.each([
		{ relativeTime: "yes", autoRefreshMinutes: 3 },
		{ relativeTime: 1, autoRefreshMinutes: "5" },
	])("loadViewSettings falls back to defaults for invalid relativeTime / autoRefreshMinutes %#", (value) => {
		localStorage.setItem(
			"review-dashboard:v1:view",
			JSON.stringify({ grouping: "owner", sortKey: "title", sortDirection: "asc", ...value }),
		);
		expect(loadViewSettings()).toMatchObject({ relativeTime: false, autoRefreshMinutes: 0 });
	});

	it("loadViewSettings returns null when a field is missing (old format)", () => {
		localStorage.setItem("review-dashboard:v1:view", JSON.stringify({ grouping: "none", sortKey: "diff" }));
		expect(loadViewSettings()).toBeNull();
	});
});

describe("storage: cache", () => {
	const cache: Cache = {
		query: createSearchQuery("is:pr author:@me"),
		fetchedAt: "2026-09-28T05:05:00Z",
		pullRequests: [
			{
				number: 1,
				title: "Fix pagination bug",
				isDraft: false,
				url: "https://github.com/acme/web/pull/1",
				repository: "acme/web",
				owner: "acme",
				author: null,
				diffStat: { additions: 1, deletions: 2, changedFiles: 3 },
				createdAt: "2026-09-27T01:02:00Z",
				updatedAt: "2026-09-28T05:05:00Z",
				latestReviews: [
					{ reviewer: { login: "carol", avatarUrl: null }, state: "APPROVED", submittedAt: "2026-09-28T00:00:00Z" },
					{ reviewer: null, state: "DISMISSED", submittedAt: "2026-09-28T01:00:00Z" },
				],
				stack: null,
			},
		],
	};
	const store = (value: unknown) => localStorage.setItem("review-dashboard:v1:cache", JSON.stringify([value]));
	const query = cache.query;
	const pr = cache.pullRequests[0];

	it("saveCache then loadCache round-trips", () => {
		saveCache(cache);
		expect(loadCache(query)).toEqual(cache);
	});

	it("saveCache then loadCache round-trips a stack position", () => {
		const stacked = { ...cache, pullRequests: [{ ...pr, stack: { number: 20, position: 2, size: 3 } }] };
		saveCache(stacked);
		expect(loadCache(query)).toEqual(stacked);
	});

	it("keeps caches for several queries", () => {
		const other = { ...cache, query: createSearchQuery("is:pr") };
		saveCache(cache);
		saveCache(other);
		expect(loadCache(query)).toEqual(cache);
		expect(loadCache(other.query)).toEqual(other);
	});

	it("keeps at most 5 caches, dropping the oldest", () => {
		for (const q of ["q1", "q2", "q3", "q4", "q5", "q6"]) {
			saveCache({ ...cache, query: createSearchQuery(q) });
		}
		expect(loadCache(createSearchQuery("q1"))).toBeNull();
		expect(loadCache(createSearchQuery("q6"))).not.toBeNull();
	});

	it("loadCache returns null for a query without a cache", () => {
		saveCache(cache);
		expect(loadCache(createSearchQuery("is:pr"))).toBeNull();
	});

	it("loadCache returns null for a single cache object (old format)", () => {
		localStorage.setItem("review-dashboard:v1:cache", JSON.stringify(cache));
		expect(loadCache(query)).toBeNull();
	});

	it("saveCache keeps the newest caches that fit when the quota is exceeded", () => {
		const limited = fakeStorage();
		const setItem = limited.setItem;
		limited.setItem = (key, value) => {
			if (value.length > 1000) {
				throw new DOMException("full", "QuotaExceededError");
			}
			setItem(key, value);
		};
		vi.stubGlobal("localStorage", limited);
		saveCache({ ...cache, query: createSearchQuery("old") });
		saveCache(cache);
		expect(loadCache(query)).toEqual(cache);
		expect(loadCache(createSearchQuery("old"))).toBeNull();
	});

	it("loadCache returns null for invalid JSON", () => {
		localStorage.setItem("review-dashboard:v1:cache", "{not json");
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when query is empty (cannot build SearchQuery)", () => {
		store({ ...cache, query: "  " });
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when a pull request lacks diffStat (old format)", () => {
		const { diffStat: _, ...old } = pr;
		store({ ...cache, pullRequests: [old] });
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when a pull request lacks isDraft (old format)", () => {
		const { isDraft: _, ...old } = pr;
		store({ ...cache, pullRequests: [old] });
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when a pull request lacks stack (old format)", () => {
		const { stack: _, ...old } = pr;
		store({ ...cache, pullRequests: [old] });
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when a review has an unknown state", () => {
		store({ ...cache, pullRequests: [{ ...pr, latestReviews: [{ ...pr.latestReviews[0], state: "PENDING" }] }] });
		expect(loadCache(query)).toBeNull();
	});

	it("loadCache returns null when pullRequests is not an array", () => {
		store({ ...cache, pullRequests: {} });
		expect(loadCache(query)).toBeNull();
	});

	it("saveCache does not throw when setItem throws (quota exceeded)", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(() => saveCache(cache)).not.toThrow();
	});
});

describe("storage: clearSession", () => {
	it("clearSession removes token and cache", () => {
		saveToken("ghp_example");
		localStorage.setItem("review-dashboard:v1:cache", "{}");
		clearSession();
		expect(localStorage.getItem("review-dashboard:v1:token")).toBeNull();
		expect(localStorage.getItem("review-dashboard:v1:cache")).toBeNull();
	});

	it("clearSession keeps view settings", () => {
		const settings = { ...DEFAULT_VIEW_SETTINGS, grouping: "owner", relativeTime: true, autoRefreshMinutes: 10 } as const;
		saveViewSettings(settings);
		clearSession();
		expect(loadViewSettings()).toEqual(settings);
	});

	it("clearSession does not throw when localStorage access throws", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(() => clearSession()).not.toThrow();
	});
});
