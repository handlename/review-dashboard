import type { PullRequest } from "./pullRequest";
import type { SortDirection, SortKey } from "./viewSettings";

const collator = new Intl.Collator("en");

// A null author is compared as "ghost", matching how the table shows it.
const authorLogin = (pr: PullRequest) => pr.author?.login ?? "ghost";

// The Repository column shows the name without the owner, which has its own column.
const repositoryName = (pr: PullRequest) => pr.repository.slice(pr.owner.length + 1);

const compareBy: Record<SortKey, (a: PullRequest, b: PullRequest) => number> = {
	number: (a, b) => a.number - b.number,
	title: (a, b) => collator.compare(a.title, b.title),
	owner: (a, b) => collator.compare(a.owner, b.owner),
	repository: (a, b) => collator.compare(repositoryName(a), repositoryName(b)),
	author: (a, b) => collator.compare(authorLogin(a), authorLogin(b)),
	diff: (a, b) =>
		a.diffStat.additions +
		a.diffStat.deletions -
		(b.diffStat.additions + b.diffStat.deletions),
	createdAt: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
	updatedAt: (a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt),
};

export function sortPullRequests(
	prs: readonly PullRequest[],
	sortKey: SortKey,
	direction: SortDirection,
): readonly PullRequest[] {
	const compare = compareBy[sortKey];
	const sign = direction === "asc" ? 1 : -1;
	return [...prs].sort((a, b) => sign * compare(a, b));
}
