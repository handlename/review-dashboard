import type { PullRequestsState } from "../app/pullRequestsReducer";

export function StatusBar(props: { state: PullRequestsState }) {
	const { state } = props;
	switch (state.status) {
		case "Fetching":
			return (
				<div>
					<span>Not fetched yet</span> <span>Loading...</span>
				</div>
			);
		case "Error":
			return (
				<div>
					<span>Not fetched yet</span>
					<p>{state.error.message}</p>
				</div>
			);
		default:
			return null;
	}
}
