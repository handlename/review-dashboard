import type { PullRequest } from "../domain/pullRequest";
import type { SortDirection, SortKey } from "../domain/viewSettings";
import { PullRequestTable } from "./PullRequestTable";

export function GroupSection(props: {
	name: string;
	pullRequests: readonly PullRequest[];
	sortKey: SortKey;
	sortDirection: SortDirection;
	onSort(key: SortKey): void;
}) {
	const { name, ...table } = props;
	return (
		<section>
			<h2>
				{name} <span>({props.pullRequests.length})</span>
			</h2>
			<PullRequestTable {...table} />
		</section>
	);
}
