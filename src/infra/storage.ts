import type { Cache } from "../domain/cache";
import type { Actor, PullRequest, Review } from "../domain/pullRequest";
import type { SearchQuery } from "../domain/searchQuery";
import { createSearchQuery } from "../domain/searchQuery";
import type { ViewSettings } from "../domain/viewSettings";

const PREFIX = "review-dashboard:v1:";

const KEYS = {
	token: `${PREFIX}token`,
	query: `${PREFIX}query`,
	view: `${PREFIX}view`,
	cache: `${PREFIX}cache`,
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

function remove(key: string): void {
	try {
		localStorage.removeItem(key);
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

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number => typeof value === "number";

function isActor(value: unknown): value is Actor {
	return isObject(value) && isString(value.login) && (value.avatarUrl === null || isString(value.avatarUrl));
}

function isReview(value: unknown): value is Review {
	return (
		isObject(value) &&
		(value.reviewer === null || isActor(value.reviewer)) &&
		isOneOf(value.state, ["APPROVED", "CHANGES_REQUESTED", "COMMENTED", "DISMISSED"]) &&
		isString(value.submittedAt)
	);
}

function isPullRequest(value: unknown): value is PullRequest {
	return (
		isObject(value) &&
		isNumber(value.number) &&
		isString(value.title) &&
		isString(value.url) &&
		isString(value.repository) &&
		isString(value.owner) &&
		(value.author === null || isActor(value.author)) &&
		isObject(value.diffStat) &&
		isNumber(value.diffStat.additions) &&
		isNumber(value.diffStat.deletions) &&
		isNumber(value.diffStat.changedFiles) &&
		isString(value.createdAt) &&
		isString(value.updatedAt) &&
		Array.isArray(value.latestReviews) &&
		value.latestReviews.every(isReview)
	);
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

export function loadCache(): Cache | null {
	const value = readJson(KEYS.cache);
	if (
		!isObject(value) ||
		!isString(value.query) ||
		!isString(value.fetchedAt) ||
		!Array.isArray(value.pullRequests) ||
		!value.pullRequests.every(isPullRequest)
	) {
		return null;
	}
	try {
		return { query: createSearchQuery(value.query), fetchedAt: value.fetchedAt, pullRequests: value.pullRequests };
	} catch {
		return null;
	}
}

export function saveCache(cache: Cache): void {
	write(KEYS.cache, JSON.stringify(cache));
}

// The search query and view settings are kept across logouts.
export function clearSession(): void {
	remove(KEYS.token);
	remove(KEYS.cache);
}
