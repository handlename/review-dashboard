import type { PullRequest } from "../domain/pullRequest";
import type { SortDirection, SortKey } from "../domain/viewSettings";
import { formatDateTime, formatFileCount, formatNumber } from "./format";
import { ExternalLinkIcon, SortIcon } from "./icons";
import { Avatar, ReviewBadges, loginOf } from "./ReviewBadges";

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
			{title} <ExternalLinkIcon />
			<span className="visually-hidden"> (opens in a new tab)</span>
		</a>
	);
}

// Allows the repository name to wrap after the owner.
function Repository(props: { name: string }) {
	const [owner, ...rest] = props.name.split("/");
	return rest.length === 0 ? (
		<>{props.name}</>
	) : (
		<>
			{owner}/<wbr />
			{rest.join("/")}
		</>
	);
}

const COLUMNS: readonly { readonly key: SortKey | null; readonly label: string; readonly className: string }[] = [
	{ key: "number", label: "#", className: "col-number" },
	{ key: "title", label: "Title", className: "col-title" },
	{ key: "repository", label: "Repository", className: "col-repository" },
	{ key: "author", label: "Author", className: "col-author" },
	{ key: null, label: "Reviews", className: "col-reviews" },
	{ key: "diff", label: "Diff", className: "col-diff" },
	{ key: "createdAt", label: "Created", className: "col-created" },
	{ key: "updatedAt", label: "Updated", className: "col-updated" },
];

export function PullRequestTable(props: {
	pullRequests: readonly PullRequest[];
	sortKey: SortKey;
	sortDirection: SortDirection;
	onSort(key: SortKey): void;
}) {
	return (
		<div className="table-wrapper">
		<table className="pr-table">
			<thead>
				<tr>
					{COLUMNS.map(({ key, label, className }) => (
						<th
							key={label}
							className={className}
							scope="col"
							aria-sort={
								key === props.sortKey ? (props.sortDirection === "asc" ? "ascending" : "descending") : undefined
							}
						>
							{key === null ? (
								label
							) : (
								<button type="button" className="sort-button" onClick={() => props.onSort(key)}>
									{label}
									{key === props.sortKey && <SortIcon direction={props.sortDirection} />}
								</button>
							)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{props.pullRequests.map((pr) => (
					<tr key={pr.url}>
						<td className="col-number">#{pr.number}</td>
						<td>
							<Title pr={pr} />
						</td>
						<td>
							<Repository name={pr.repository} />
						</td>
						<td>
							<div className="author">
								<Avatar actor={pr.author} />
								<span className="author-login">{loginOf(pr.author)}</span>
							</div>
						</td>
						<td>
							<ReviewBadges reviews={pr.latestReviews} />
						</td>
						<td className="col-diff">
							<span className="diff-additions">+{formatNumber(pr.diffStat.additions)}</span>{" "}
							<span className="diff-deletions">-{formatNumber(pr.diffStat.deletions)}</span>
							<br />
							<span className="diff-files">{formatFileCount(pr.diffStat.changedFiles)}</span>
						</td>
						<td className="col-created">
							<DateTime iso={pr.createdAt} />
						</td>
						<td className="col-updated">
							<DateTime iso={pr.updatedAt} />
						</td>
					</tr>
				))}
			</tbody>
		</table>
		</div>
	);
}
