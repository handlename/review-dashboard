import { describe, expect, it } from "vitest";
import { DEFAULT_QUERY, createSearchQuery } from "./searchQuery";

describe("searchQuery", () => {
	it('DEFAULT_QUERY equals "is:pr review-requested:@me state:open archived:false"', () => {
		expect(DEFAULT_QUERY).toBe(
			"is:pr review-requested:@me state:open archived:false",
		);
	});

	it("createSearchQuery throws on empty string", () => {
		expect(() => createSearchQuery("")).toThrow();
	});

	it("createSearchQuery throws on whitespace-only string", () => {
		expect(() => createSearchQuery(" \t\n ")).toThrow();
	});

	it("createSearchQuery trims surrounding whitespace", () => {
		expect(createSearchQuery("  is:pr  ")).toBe("is:pr");
	});

	it("createSearchQuery keeps inner text as is", () => {
		expect(createSearchQuery("is:pr  author:@me")).toBe("is:pr  author:@me");
	});
});
