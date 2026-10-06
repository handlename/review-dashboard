import type { PullRequest } from "../domain/pullRequest";
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

export function PullRequestTable(props: {
	pullRequests: readonly PullRequest[];
}) {
	return (
		<table>
			<thead>
				<tr>
					<th scope="col">#</th>
					<th scope="col">Title</th>
					<th scope="col">Repository</th>
					<th scope="col">Author</th>
					<th scope="col">Reviews</th>
					<th scope="col">Diff</th>
					<th scope="col">Created</th>
					<th scope="col">Updated</th>
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
