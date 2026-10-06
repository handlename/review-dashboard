import { describe, expect, it } from "vitest";
import { formatDateTime, formatFileCount, formatNumber } from "./format";

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

	it('formatNumber inserts thousands separators (12345 → "12,345")', () => {
		expect(formatNumber(12345)).toBe("12,345");
	});

	it('formatFileCount returns "1 file" for 1 and "n files" otherwise (0, 2)', () => {
		expect(formatFileCount(1)).toBe("1 file");
		expect(formatFileCount(0)).toBe("0 files");
		expect(formatFileCount(2)).toBe("2 files");
	});
});
