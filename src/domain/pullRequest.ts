export type ReviewState =
	| "APPROVED"
	| "CHANGES_REQUESTED"
	| "COMMENTED"
	| "DISMISSED";

export type Actor = {
	readonly login: string;
	// null unless it starts with https://avatars.githubusercontent.com/
	readonly avatarUrl: string | null;
};

export type Review = {
	// null if the user account has been deleted
	readonly reviewer: Actor | null;
	readonly state: ReviewState;
	readonly submittedAt: string;
};

export type DiffStat = {
	readonly additions: number;
	readonly deletions: number;
	readonly changedFiles: number;
};

export type PullRequest = {
	readonly number: number;
	readonly title: string;
	readonly isDraft: boolean;
	readonly url: string;
	readonly repository: string;
	readonly owner: string;
	readonly author: Actor | null;
	readonly diffStat: DiffStat;
	readonly createdAt: string;
	readonly updatedAt: string;
	readonly latestReviews: readonly Review[];
};
