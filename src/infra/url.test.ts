import { describe, expect, it } from "vitest";
import { DEFAULT_QUERY, createSearchQuery } from "../domain/searchQuery";
import { queryFromSearch, searchFor } from "./url";

describe("url", () => {
	it("queryFromSearch reads the q parameter", () => {
		expect(queryFromSearch("?q=is%3Apr+author%3A%40me")).toBe(
			"is:pr author:@me",
		);
	});

	it("queryFromSearch returns null without the q parameter", () => {
		expect(queryFromSearch("")).toBeNull();
		expect(queryFromSearch("?other=1")).toBeNull();
	});

	it("queryFromSearch returns null for an empty or whitespace-only q", () => {
		expect(queryFromSearch("?q=")).toBeNull();
		expect(queryFromSearch("?q=+++")).toBeNull();
	});

	it("searchFor omits the default query", () => {
		expect(searchFor(DEFAULT_QUERY)).toBe("");
	});

	it("searchFor round-trips through queryFromSearch", () => {
		const query = createSearchQuery('is:pr label:"needs review" repo:acme/web');
		expect(queryFromSearch(searchFor(query))).toBe(query);
	});
});
