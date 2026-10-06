import type { PullRequest } from "./pullRequest";
import type { Grouping } from "./viewSettings";

export type PullRequestGroup = {
	readonly name: string;
	readonly pullRequests: readonly PullRequest[];
};

const collator = new Intl.Collator("en");

export function groupPullRequests(
	prs: readonly PullRequest[],
	grouping: Grouping,
): readonly PullRequestGroup[] {
	if (grouping === "none") {
		return [{ name: "", pullRequests: prs }];
	}
	const groups = new Map<string, PullRequest[]>();
	for (const pr of prs) {
		const name = grouping === "owner" ? pr.owner : pr.repository;
		const group = groups.get(name) ?? [];
		group.push(pr);
		groups.set(name, group);
	}
	return [...groups]
		.map(([name, pullRequests]) => ({ name, pullRequests }))
		.sort((a, b) => collator.compare(a.name, b.name));
}
