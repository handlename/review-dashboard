import type { Actor, PullRequest, Review, ReviewState } from "../domain/pullRequest";
import { SEARCH_LIMIT } from "../domain/searchQuery";

type ActorNode = { readonly login: string; readonly avatarUrl: string } | null;

type ReviewNode = {
	readonly author: ActorNode;
	readonly state: string;
	readonly submittedAt: string | null;
};

type PullRequestNode = {
	readonly number: number;
	readonly title: string;
	readonly url: string;
	readonly author: ActorNode;
	readonly additions: number;
	readonly deletions: number;
	readonly changedFiles: number;
	readonly createdAt: string;
	readonly updatedAt: string;
	readonly repository: {
		readonly nameWithOwner: string;
		readonly owner: { readonly login: string };
	};
	readonly latestReviews: {
		readonly nodes: readonly (ReviewNode | null)[] | null;
	} | null;
};

// Non-PullRequest results (issues) match no fragment and arrive as empty objects.
export type SearchNode = PullRequestNode | Record<string, never>;

export type SearchPage = {
	issueCount: number;
	pageInfo: { hasNextPage: boolean; endCursor: string | null };
	nodes: readonly (SearchNode | null)[] | null;
};

export type FetchErrorKind = "Unauthorized" | "Network" | "RateLimit" | "Other";

export type FetchFailure = {
	readonly kind: FetchErrorKind;
	readonly message: string;
};

const AVATAR_ORIGIN = "https://avatars.githubusercontent.com/";

const REVIEW_STATES: readonly string[] = [
	"APPROVED",
	"CHANGES_REQUESTED",
	"COMMENTED",
	"DISMISSED",
];

function toAvatarUrl(url: string): string | null {
	return url.startsWith(AVATAR_ORIGIN) ? url : null;
}

function toActor(node: ActorNode): Actor | null {
	return node === null
		? null
		: { login: node.login, avatarUrl: toAvatarUrl(node.avatarUrl) };
}

function isPullRequestNode(node: SearchNode | null): node is PullRequestNode {
	return node !== null && "number" in node;
}

function toReviews(
	nodes: readonly (ReviewNode | null)[] | null,
): readonly Review[] {
	return (nodes ?? []).flatMap((node) =>
		node !== null &&
		node.submittedAt !== null &&
		REVIEW_STATES.includes(node.state)
			? [
					{
						reviewer: toActor(node.author),
						state: node.state as ReviewState,
						submittedAt: node.submittedAt,
					},
				]
			: [],
	);
}

export function toPullRequests(
	nodes: readonly (SearchNode | null)[],
): readonly PullRequest[] {
	// The same pull request can appear on two pages when results shift during pagination.
	const unique = new Map(nodes.filter(isPullRequestNode).map((node) => [node.url, node]));
	return [...unique.values()].map((node) => ({
		number: node.number,
		title: node.title,
		url: node.url,
		repository: node.repository.nameWithOwner,
		owner: node.repository.owner.login,
		author: toActor(node.author),
		diffStat: {
			additions: node.additions,
			deletions: node.deletions,
			changedFiles: node.changedFiles,
		},
		createdAt: node.createdAt,
		updatedAt: node.updatedAt,
		latestReviews: toReviews(node.latestReviews?.nodes ?? null),
	}));
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function messageOf(body: unknown, fallback: string): string {
	return isObject(body) && typeof body.message === "string"
		? body.message
		: fallback;
}

export function toFetchFailure(
	status: number,
	body: unknown,
): FetchFailure | null {
	if (status === 401) {
		return {
			kind: "Unauthorized",
			message: messageOf(body, "Bad credentials"),
		};
	}
	// ARCHITECTURE treats every 403 as a rate limit, including SSO and permission errors.
	if (status === 403 || status === 429) {
		return { kind: "RateLimit", message: messageOf(body, `HTTP ${status}`) };
	}
	if (status < 200 || status >= 300) {
		return { kind: "Other", message: messageOf(body, `HTTP ${status}`) };
	}
	if (!isObject(body)) {
		return { kind: "Other", message: "Unexpected response" };
	}

	const errors = Array.isArray(body.errors) ? body.errors.filter(isObject) : [];
	if (errors.some((e) => e.type === "RATE_LIMITED")) {
		return {
			kind: "RateLimit",
			message: messageOf(
				errors.find((e) => e.type === "RATE_LIMITED"),
				"RATE_LIMITED",
			),
		};
	}
	// Partial results (e.g. FORBIDDEN for an organization requiring SSO) are accepted; their null nodes are dropped.
	if (isObject(body.data) && isObject(body.data.search)) {
		return null;
	}
	if (errors.length > 0) {
		return {
			kind: "Other",
			message: messageOf(errors[0], "Unexpected response"),
		};
	}
	return { kind: "Other", message: "Unexpected response" };
}

export function toThrownFailure(error: unknown): FetchFailure | null {
	if (error instanceof DOMException && error.name === "AbortError") {
		return null;
	}
	if (error instanceof TypeError) {
		return { kind: "Network", message: error.message };
	}
	return {
		kind: "Other",
		message: error instanceof Error ? error.message : String(error),
	};
}

export function nextCursor(
	page: SearchPage,
	fetchedNodes: number,
): string | null {
	return page.pageInfo.hasNextPage && fetchedNodes < SEARCH_LIMIT
		? page.pageInfo.endCursor
		: null;
}
