import { describe, expect, it } from "vitest";
import type { ViewSettings } from "./viewSettings";
import { DEFAULT_VIEW_SETTINGS, isAutoRefreshMinutes, toggleSort } from "./viewSettings";

describe("viewSettings", () => {
	it("DEFAULT_VIEW_SETTINGS is none / updatedAt / desc, absolute times, auto refresh off", () => {
		expect(DEFAULT_VIEW_SETTINGS).toEqual({
			grouping: "none",
			sortKey: "updatedAt",
			sortDirection: "desc",
			relativeTime: false,
			autoRefreshMinutes: 0,
		});
	});

	it.each([0, 1, 5, 10, 30])("isAutoRefreshMinutes accepts %s", (value) => {
		expect(isAutoRefreshMinutes(value)).toBe(true);
	});

	it.each([3, "5", null, undefined])("isAutoRefreshMinutes rejects %s", (value) => {
		expect(isAutoRefreshMinutes(value)).toBe(false);
	});

	it("toggleSort on the active key reverses direction", () => {
		const asc = toggleSort(DEFAULT_VIEW_SETTINGS, "updatedAt");
		expect(asc).toEqual({ ...DEFAULT_VIEW_SETTINGS, sortDirection: "asc" });
		expect(toggleSort(asc, "updatedAt")).toEqual(DEFAULT_VIEW_SETTINGS);
	});

	it("toggleSort on another key makes it the sort key and keeps the direction (D-1 default)", () => {
		const settings: ViewSettings = {
			...DEFAULT_VIEW_SETTINGS,
			grouping: "owner",
			sortKey: "updatedAt",
			sortDirection: "desc",
		};
		expect(toggleSort(settings, "title")).toEqual({
			...settings,
			sortKey: "title",
		});
	});
});
