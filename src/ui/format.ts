const pad = (n: number) => String(n).padStart(2, "0");

// Built from local-time getters because toLocaleString varies by locale.
export function formatDateTime(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Times less than a minute old are "now", including future times: `now` may lag by up to a minute
// and clocks may disagree with GitHub's.
export function formatRelativeTime(iso: string, now: Date): string {
	const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000);
	if (seconds < MINUTE) {
		return "now";
	}
	if (seconds < HOUR) {
		return relativeTimeFormat.format(-Math.floor(seconds / MINUTE), "minute");
	}
	if (seconds < DAY) {
		return relativeTimeFormat.format(-Math.floor(seconds / HOUR), "hour");
	}
	const days = Math.floor(seconds / DAY);
	if (days < 30) {
		return relativeTimeFormat.format(-days, "day");
	}
	if (days < 365) {
		return relativeTimeFormat.format(-Math.min(Math.floor(days / 30), 11), "month");
	}
	return relativeTimeFormat.format(-Math.floor(days / 365), "year");
}

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
	return numberFormat.format(n);
}

export function formatFileCount(n: number): string {
	return n === 1 ? "1 file" : `${formatNumber(n)} files`;
}

export function formatPullRequestCount(n: number): string {
	return n === 1 ? "1 pull request" : `${formatNumber(n)} pull requests`;
}

export function formatMinutes(n: number): string {
	return n === 1 ? "1 minute" : `${formatNumber(n)} minutes`;
}
