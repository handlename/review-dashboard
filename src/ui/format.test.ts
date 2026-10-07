import { describe, expect, it } from "vitest";
import { formatDateTime, formatFileCount, formatMinutes, formatNumber, formatPullRequestCount, formatRelativeTime } from "./format";

describe("format", () => {
	it("formatDateTime pads month, day, hour, and minute", () => {
		expect(formatDateTime(new Date(2026, 8, 1, 4, 5).toISOString())).toBe(
			"2026-09-01 04:05",
		);
	});

	it("formatDateTime uses 24-hour time", () => {
		expect(formatDateTime(new Date(2026, 11, 31, 23, 59).toISOString())).toBe(
			"2026-12-31 23:59",
		);
	});

	it.each([
		[-30, "now"],
		[0, "now"],
		[59, "now"],
		[60, "1 minute ago"],
		[59 * 60, "59 minutes ago"],
		[60 * 60, "1 hour ago"],
		[23 * 3600, "23 hours ago"],
		[24 * 3600, "yesterday"],
		[29 * 86400, "29 days ago"],
		[30 * 86400, "last month"],
		[364 * 86400, "11 months ago"],
		[365 * 86400, "last year"],
		[730 * 86400, "2 years ago"],
	])("formatRelativeTime for a time %i seconds before now is %s", (seconds, expected) => {
		const now = new Date("2026-10-07T12:00:00Z");
		const iso = new Date(now.getTime() - seconds * 1000).toISOString();
		expect(formatRelativeTime(iso, now)).toBe(expected);
	});

	it('formatNumber inserts thousands separators (12345 → "12,345")', () => {
		expect(formatNumber(12345)).toBe("12,345");
	});

	it('formatMinutes returns "1 minute" for 1 and "n minutes" otherwise', () => {
		expect(formatMinutes(1)).toBe("1 minute");
		expect(formatMinutes(30)).toBe("30 minutes");
	});

	it('formatFileCount returns "1 file" for 1 and "n files" otherwise (0, 2)', () => {
		expect(formatFileCount(1)).toBe("1 file");
		expect(formatFileCount(0)).toBe("0 files");
		expect(formatFileCount(2)).toBe("2 files");
	});

	it('formatPullRequestCount returns "1 pull request" for 1 and separates thousands otherwise', () => {
		expect(formatPullRequestCount(1)).toBe("1 pull request");
		expect(formatPullRequestCount(0)).toBe("0 pull requests");
		expect(formatPullRequestCount(1000)).toBe("1,000 pull requests");
	});
});
