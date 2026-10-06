import type { SearchQuery } from "../domain/searchQuery";
import { createSearchQuery } from "../domain/searchQuery";

const PREFIX = "review-dashboard:v1:";

const KEYS = {
	token: `${PREFIX}token`,
	query: `${PREFIX}query`,
} as const;

// localStorage may be unavailable or full; the page keeps working without saving.
function read(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function write(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		// Ignored: see read().
	}
}

export function loadToken(): string | null {
	return read(KEYS.token);
}

export function saveToken(token: string): void {
	write(KEYS.token, token);
}

export function loadQuery(): SearchQuery | null {
	const value = read(KEYS.query);
	if (value === null) {
		return null;
	}
	try {
		return createSearchQuery(value);
	} catch {
		return null;
	}
}

export function saveQuery(query: SearchQuery): void {
	write(KEYS.query, query);
}
