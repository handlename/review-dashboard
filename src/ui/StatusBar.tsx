import type { FetchFailure, PullRequestsState } from "../app/pullRequestsReducer";
import type { Cache } from "../domain/cache";
import { formatDateTime } from "./format";
import { RefreshIcon, SpinnerIcon, WarningIcon } from "./icons";

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
		<div className="status-bar">
			<div className="status-row">
				{view.cache === null ? (
					<span>Not fetched yet</span>
				) : (
					<span>
						Last fetched <time dateTime={view.cache.fetchedAt}>{formatDateTime(view.cache.fetchedAt)}</time>
					</span>
				)}
				{busy && (
					<span className="status-progress">
						<SpinnerIcon />
						{view.progress}
					</span>
				)}
				<div className="status-actions">
					<button
						type="button"
						className="button button-secondary"
						aria-disabled={busy || undefined}
						onClick={() => !busy && props.onRefresh()}
					>
						<RefreshIcon />
						<span>Refresh</span>
					</button>
					<button type="button" className="button button-secondary" onClick={props.onLogout}>
						<span>Log out</span>
					</button>
				</div>
			</div>
			{view.error !== null && (
				<p className="error-line">
					<WarningIcon />
					{errorMessage(view.error)}
				</p>
			)}
		</div>
	);
}
