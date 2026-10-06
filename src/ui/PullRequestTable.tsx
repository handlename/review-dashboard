import type { PullRequest } from "../domain/pullRequest";
import type { SortDirection, SortKey } from "../domain/viewSettings";
import { formatDateTime, formatFileCount, formatNumber } from "./format";
import { ReviewBadges } from "./ReviewBadges";

function DateTime(props: { iso: string }) {
	return <time dateTime={props.iso}>{formatDateTime(props.iso)}</time>;
}

function Title(props: { pr: PullRequest }) {
	const { title, url } = props.pr;
	if (!url.startsWith("https://github.com/")) {
		return <>{title}</>;
	}
	return (
		<a href={url} target="_blank" rel="noopener noreferrer">
			{title}
			<span className="visually-hidden"> (opens in a new tab)</span>
		</a>
	);
}

const COLUMNS: readonly { readonly key: SortKey | null; readonly label: string }[] = [
	{ key: "number", label: "#" },
	{ key: "title", label: "Title" },
	{ key: "repository", label: "Repository" },
	{ key: "author", label: "Author" },
	{ key: null, label: "Reviews" },
	{ key: "diff", label: "Diff" },
	{ key: "createdAt", label: "Created" },
	{ key: "updatedAt", label: "Updated" },
];

export function PullRequestTable(props: {
	pullRequests: readonly PullRequest[];
	sortKey: SortKey;
	sortDirection: SortDirection;
	onSort(key: SortKey): void;
}) {
	return (
		<table>
			<thead>
				<tr>
					{COLUMNS.map(({ key, label }) => (
						<th
							key={label}
							scope="col"
							aria-sort={
								key === props.sortKey ? (props.sortDirection === "asc" ? "ascending" : "descending") : undefined
							}
						>
							{key === null ? (
								label
							) : (
								<button type="button" onClick={() => props.onSort(key)}>
									{label}
								</button>
							)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{props.pullRequests.map((pr) => (
					<tr key={pr.url}>
						<td>#{pr.number}</td>
						<td>
							<Title pr={pr} />
						</td>
						<td>{pr.repository}</td>
						<td>{pr.author?.login ?? "ghost"}</td>
						<td>
							<ReviewBadges reviews={pr.latestReviews} />
						</td>
						<td>
							<span>+{formatNumber(pr.diffStat.additions)}</span>{" "}
							<span>-{formatNumber(pr.diffStat.deletions)}</span>
							<br />
							<span>{formatFileCount(pr.diffStat.changedFiles)}</span>
						</td>
						<td>
							<DateTime iso={pr.createdAt} />
						</td>
						<td>
							<DateTime iso={pr.updatedAt} />
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
