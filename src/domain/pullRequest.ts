export type ReviewState =
	| "APPROVED"
	| "CHANGES_REQUESTED"
	| "COMMENTED"
	| "DISMISSED";

// A user, or a team (login is "org/slug") when it is a review request.
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

// Position in a GitHub stacked pull request; values are taken from GitHub as-is.
export type StackPosition = {
	readonly number: number;
	readonly position: number;
	readonly size: number;
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
	// Users and teams whose review is requested and not yet submitted
	readonly reviewRequests: readonly Actor[];
	readonly stack: StackPosition | null;
};

// A re-requested reviewer is shown as pending only, so their earlier review is hidden.
export function respondedReviews(
	reviews: readonly Review[],
	reviewRequests: readonly Actor[],
): readonly Review[] {
	const requested = new Set(reviewRequests.map((actor) => actor.login));
	return reviews
		.filter((review) => review.reviewer === null || !requested.has(review.reviewer.login))
		.sort((a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
}
