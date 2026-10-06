import { describe, expect, it } from "vitest";
import type { ViewSettings } from "./viewSettings";
import { DEFAULT_VIEW_SETTINGS, toggleSort } from "./viewSettings";

describe("viewSettings", () => {
	it("DEFAULT_VIEW_SETTINGS is none / updatedAt / desc", () => {
		expect(DEFAULT_VIEW_SETTINGS).toEqual({
			grouping: "none",
			sortKey: "updatedAt",
			sortDirection: "desc",
		});
	});

	it("toggleSort on the active key reverses direction", () => {
		const asc = toggleSort(DEFAULT_VIEW_SETTINGS, "updatedAt");
		expect(asc).toEqual({ ...DEFAULT_VIEW_SETTINGS, sortDirection: "asc" });
		expect(toggleSort(asc, "updatedAt")).toEqual(DEFAULT_VIEW_SETTINGS);
	});

	it("toggleSort on another key makes it the sort key and keeps the direction (D-1 default)", () => {
		const settings: ViewSettings = {
			grouping: "owner",
			sortKey: "updatedAt",
			sortDirection: "desc",
		};
		expect(toggleSort(settings, "title")).toEqual({
			grouping: "owner",
			sortKey: "title",
			sortDirection: "desc",
		});
	});
});
