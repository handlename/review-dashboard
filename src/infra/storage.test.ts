import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchQuery } from "../domain/searchQuery";
import { loadQuery, loadToken, saveQuery, saveToken } from "./storage";

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

describe("storage: token and query", () => {
	it("saveToken then loadToken returns the token", () => {
		saveToken("ghp_example");
		expect(loadToken()).toBe("ghp_example");
	});

	it("loadQuery returns null for an empty or whitespace-only stored value", () => {
		localStorage.setItem("review-dashboard:v1:query", "");
		expect(loadQuery()).toBeNull();
		localStorage.setItem("review-dashboard:v1:query", "   ");
		expect(loadQuery()).toBeNull();
	});

	it("loadQuery returns null when nothing is stored", () => {
		expect(loadQuery()).toBeNull();
	});

	it("saveQuery then loadQuery returns the query", () => {
		saveQuery(createSearchQuery("is:pr author:@me"));
		expect(loadQuery()).toBe("is:pr author:@me");
	});

	it("ignores keys without the review-dashboard:v1: prefix (old format)", () => {
		localStorage.setItem("token", "ghp_old");
		localStorage.setItem("query", "is:pr");
		expect(loadToken()).toBeNull();
		expect(loadQuery()).toBeNull();
	});

	it("load* returns null when localStorage access throws", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(loadToken()).toBeNull();
		expect(loadQuery()).toBeNull();
	});

	it("save* does not throw when setItem throws (quota exceeded)", () => {
		vi.stubGlobal("localStorage", throwingStorage());
		expect(() => saveToken("ghp_example")).not.toThrow();
		expect(() => saveQuery(createSearchQuery("is:pr"))).not.toThrow();
	});
});
