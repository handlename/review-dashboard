import type { SearchQuery } from "../domain/searchQuery";
import { createSearchQuery } from "../domain/searchQuery";
import type { ViewSettings } from "../domain/viewSettings";

const PREFIX = "review-dashboard:v1:";

const KEYS = {
	token: `${PREFIX}token`,
	query: `${PREFIX}query`,
	view: `${PREFIX}view`,
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

function readJson(key: string): unknown {
	const value = read(key);
	if (value === null) {
		return undefined;
	}
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
	return options.includes(value as T);
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

export function loadViewSettings(): ViewSettings | null {
	const value = readJson(KEYS.view);
	if (
		!isObject(value) ||
		!isOneOf(value.grouping, ["none", "owner", "repository"]) ||
		!isOneOf(value.sortKey, ["number", "title", "repository", "author", "diff", "createdAt", "updatedAt"]) ||
		!isOneOf(value.sortDirection, ["asc", "desc"])
	) {
		return null;
	}
	return { grouping: value.grouping, sortKey: value.sortKey, sortDirection: value.sortDirection };
}

export function saveViewSettings(settings: ViewSettings): void {
	write(KEYS.view, JSON.stringify(settings));
}
