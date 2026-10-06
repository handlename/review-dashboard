import { useEffect, useId, useRef, useState } from "react";
import type { PullRequestsState } from "../app/pullRequestsReducer";
import { useAutoRefresh } from "../app/useAutoRefresh";
import { usePullRequests } from "../app/usePullRequests";
import { useNow } from "../app/useNow";
import { useSettings } from "../app/useSettings";
import type { PullRequestGroup } from "../domain/group";
import type { Grouping, SortKey, ViewSettings } from "../domain/viewSettings";
import { formatNumber } from "./format";
import { GroupSection } from "./GroupSection";
import { GearIcon } from "./icons";
import { PullRequestTable } from "./PullRequestTable";
import { QueryBar } from "./QueryBar";
import { SettingsDialog } from "./SettingsDialog";
import { StatusBar, errorMessage } from "./StatusBar";
import { TokenForm } from "./TokenForm";

const GROUPING_OPTIONS: readonly {
	readonly value: Grouping;
	readonly label: string;
}[] = [
	{ value: "none", label: "None" },
	{ value: "owner", label: "Organization" },
	{ value: "repository", label: "Repository" },
];

function GroupingSelect(props: {
	grouping: Grouping;
	onChange(grouping: Grouping): void;
}) {
	const id = useId();
	return (
		<div className="grouping">
			<label className="field-label" htmlFor={id}>
				Group by
			</label>
			<select
				id={id}
				className="select"
				value={props.grouping}
				onChange={(e) => props.onChange(e.target.value as Grouping)}
			>
				{GROUPING_OPTIONS.map(({ value, label }) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>
		</div>
	);
}

function PullRequestList(props: {
	state: PullRequestsState;
	groups: readonly PullRequestGroup[] | null;
	viewSettings: ViewSettings;
	onSort(key: SortKey): void;
	now: Date | null;
}) {
	const { state, groups, viewSettings, onSort, now } = props;
	switch (state.status) {
		case "Fetching":
			return <p className="muted list-message">Loading pull requests...</p>;
		case "Error":
			return <p className="muted list-message">Could not load pull requests.</p>;
		default: {
			if (groups === null) {
				return null;
			}
			const sort = {
				sortKey: viewSettings.sortKey,
				sortDirection: viewSettings.sortDirection,
				onSort,
				grouping: viewSettings.grouping,
				now,
			};
			if (groups.every((group) => group.pullRequests.length === 0)) {
				return <p className="muted list-message">No pull requests match this query.</p>;
			}
			const truncated = state.status === "Ready" && state.truncated && (
				<p className="muted truncated-line">
					Showing {formatNumber(groups.reduce((n, group) => n + group.pullRequests.length, 0))} of{" "}
					{formatNumber(state.issueCount)} results (search limit: 1,000)
				</p>
			);
			if (viewSettings.grouping === "none") {
				return (
					<>
						{truncated}
						<PullRequestTable pullRequests={groups[0].pullRequests} {...sort} />
					</>
				);
			}
			return (
				<>
					{truncated}
					{groups.map((group) => (
						<GroupSection key={group.name} name={group.name} pullRequests={group.pullRequests} {...sort} />
					))}
				</>
			);
		}
	}
}

// Texts for the always-present live regions (UI_DESIGN "State matrix").
function liveRegionTexts(state: PullRequestsState, count: number): { status: string; alert: string } {
	switch (state.status) {
		case "Refreshing":
			return { status: "Refreshing pull requests", alert: "" };
		case "Fetching":
			return { status: "Loading pull requests", alert: "" };
		case "Ready":
			return { status: `Updated. ${count} pull requests`, alert: "" };
		case "ErrorWithCache":
		case "Error":
			return { status: "", alert: errorMessage(state.error) };
		case "Unauthorized":
			return { status: "", alert: "Your token is invalid or expired." };
		default:
			return { status: "", alert: "" };
	}
}

export function App() {
	const {
		token,
		saveToken,
		logout,
		viewSettings,
		setGrouping,
		toggleSort,
		setRelativeTime,
		setAutoRefreshMinutes,
	} = useSettings();
	const { state, pullRequests, groups, applyQuery, refresh } = usePullRequests(token, viewSettings);
	const now = useNow(viewSettings.relativeTime);
	const timer = useAutoRefresh(state, viewSettings.autoRefreshMinutes, refresh);
	const settingsRef = useRef<HTMLDialogElement>(null);

	const unauthorized = state.status === "Unauthorized";
	const dashboard = token !== null && !unauthorized;
	const live = liveRegionTexts(state, pullRequests?.length ?? 0);

	// Focus follows screen changes, but not the screen shown on load.
	const headingRef = useRef<HTMLHeadingElement>(null);
	const previousDashboard = useRef(dashboard);
	const [screenChanged, setScreenChanged] = useState(false);
	useEffect(() => {
		if (previousDashboard.current === dashboard) {
			return;
		}
		previousDashboard.current = dashboard;
		setScreenChanged(true);
		if (dashboard) {
			headingRef.current?.focus();
		}
	}, [dashboard]);

	return (
		<>
			<header className="app-header">
				<div className="app-header-inner">
					<h1 ref={headingRef} className="app-title" tabIndex={-1}>
						review-dashboard
					</h1>
					{dashboard && (
						<div className="header-actions">
							<GroupingSelect grouping={viewSettings.grouping} onChange={setGrouping} />
							<button
								type="button"
								className="button button-secondary"
								aria-label="Settings"
								aria-haspopup="dialog"
								onClick={() => settingsRef.current?.showModal()}
							>
								<GearIcon />
							</button>
						</div>
					)}
				</div>
			</header>
			<main className="app-main">
				{!dashboard ? (
					// Remount on logout from Unauthorized so focus and a stale error are reset.
					<TokenForm
						key={unauthorized ? "unauthorized" : "signed-out"}
						onSave={saveToken}
						unauthorized={unauthorized}
						onLogout={logout}
						focusInput={screenChanged}
					/>
				) : (
					<>
						<QueryBar query={state.query} onApply={applyQuery} />
						<StatusBar state={state} timer={timer} onRefresh={refresh} />
						<PullRequestList state={state} groups={groups} viewSettings={viewSettings} onSort={toggleSort} now={now} />
						<SettingsDialog
							dialogRef={settingsRef}
							relativeTime={viewSettings.relativeTime}
							autoRefreshMinutes={viewSettings.autoRefreshMinutes}
							onRelativeTimeChange={setRelativeTime}
							onAutoRefreshMinutesChange={setAutoRefreshMinutes}
							onLogout={logout}
						/>
					</>
				)}
			</main>
			<div className="visually-hidden" role="status">
				{live.status}
			</div>
			<div className="visually-hidden" role="alert">
				{live.alert}
			</div>
		</>
	);
}
