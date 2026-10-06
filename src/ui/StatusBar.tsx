import type { FetchFailure, PullRequestsState } from "../app/pullRequestsReducer";
import type { Cache } from "../domain/cache";
import { formatDateTime } from "./format";

type StatusView = {
	readonly cache: Cache | null;
	readonly progress: string | null;
	readonly error: FetchFailure | null;
};

function statusView(state: PullRequestsState): StatusView | null {
	switch (state.status) {
		case "ShowingCache":
		case "Ready":
			return { cache: state.cache, progress: null, error: null };
		case "Refreshing":
			return { cache: state.cache, progress: "Refreshing...", error: null };
		case "ErrorWithCache":
			return { cache: state.cache, progress: null, error: state.error };
		case "Fetching":
			return { cache: null, progress: "Loading...", error: null };
		case "Error":
			return { cache: null, progress: null, error: state.error };
		default:
			return null;
	}
}

export function errorMessage(error: FetchFailure): string {
	switch (error.kind) {
		case "Network":
			return "Could not reach GitHub. Check your connection and press Refresh.";
		case "RateLimit":
			return "GitHub rate limit reached. Try again later.";
		case "Unauthorized":
			return "Your token is invalid or expired.";
		case "Other":
			return `GitHub returned an error: ${error.message}`;
	}
}

export function StatusBar(props: { state: PullRequestsState; onRefresh(): void; onLogout(): void }) {
	const view = statusView(props.state);
	if (view === null) {
		return null;
	}
	const busy = view.progress !== null;

	return (
		<div>
			{view.cache === null ? (
				<span>Not fetched yet</span>
			) : (
				<span>
					Last fetched{" "}
					<time dateTime={view.cache.fetchedAt}>
						{formatDateTime(view.cache.fetchedAt)}
					</time>
				</span>
			)}
			{busy && <span>{view.progress}</span>}
			<button
				type="button"
				aria-disabled={busy || undefined}
				onClick={() => !busy && props.onRefresh()}
			>
				Refresh
			</button>
			<button type="button" onClick={props.onLogout}>
				Log out
			</button>
			{view.error !== null && <p>{errorMessage(view.error)}</p>}
		</div>
	);
}
