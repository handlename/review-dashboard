import type { PullRequestsState } from "../app/pullRequestsReducer";
import { usePullRequests } from "../app/usePullRequests";
import { useSettings } from "../app/useSettings";
import type { PullRequest } from "../domain/pullRequest";
import { PullRequestTable } from "./PullRequestTable";
import { QueryBar } from "./QueryBar";
import { StatusBar } from "./StatusBar";
import { TokenForm } from "./TokenForm";

function PullRequestList(props: { state: PullRequestsState; pullRequests: readonly PullRequest[] | null }) {
	const { state, pullRequests } = props;
	switch (state.status) {
		case "Fetching":
			return <p>Loading pull requests...</p>;
		case "Error":
			return <p>Could not load pull requests.</p>;
		default:
			if (pullRequests === null) {
				return null;
			}
			if (pullRequests.length === 0) {
				return <p>No pull requests match this query.</p>;
			}
			return <PullRequestTable pullRequests={pullRequests} />;
	}
}

export function App() {
	const { token, saveToken } = useSettings();
	const { state, pullRequests, applyQuery } = usePullRequests(token);

	return (
		<>
			<header>
				<h1 tabIndex={-1}>review-dashboard</h1>
			</header>
			<main>
				{token === null ? (
					<TokenForm onSave={saveToken} />
				) : (
					<>
						<QueryBar query={state.query} onApply={applyQuery} />
						<StatusBar state={state} />
						<PullRequestList state={state} pullRequests={pullRequests} />
					</>
				)}
			</main>
		</>
	);
}
