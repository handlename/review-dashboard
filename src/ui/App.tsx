import { useId } from "react";
import type { PullRequestsState } from "../app/pullRequestsReducer";
import { usePullRequests } from "../app/usePullRequests";
import { useSettings } from "../app/useSettings";
import type { PullRequestGroup } from "../domain/group";
import type { Grouping, SortKey, ViewSettings } from "../domain/viewSettings";
import { formatNumber } from "./format";
import { GroupSection } from "./GroupSection";
import { PullRequestTable } from "./PullRequestTable";
import { QueryBar } from "./QueryBar";
import { StatusBar } from "./StatusBar";
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
		<div>
			<label htmlFor={id}>Group by</label>
			<select
				id={id}
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
}) {
	const { state, groups, viewSettings, onSort } = props;
	switch (state.status) {
		case "Fetching":
			return <p>Loading pull requests...</p>;
		case "Error":
			return <p>Could not load pull requests.</p>;
		default: {
			if (groups === null) {
				return null;
			}
			const sort = {
				sortKey: viewSettings.sortKey,
				sortDirection: viewSettings.sortDirection,
				onSort,
			};
			if (groups.every((group) => group.pullRequests.length === 0)) {
				return <p>No pull requests match this query.</p>;
			}
			const truncated = state.status === "Ready" && state.truncated && (
				<p>
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

export function App() {
	const { token, saveToken, logout, viewSettings, setGrouping, toggleSort } = useSettings();
	const { state, groups, applyQuery, refresh } = usePullRequests(token, viewSettings);

	const unauthorized = state.status === "Unauthorized";
	const dashboard = token !== null && !unauthorized;

	return (
		<>
			<header>
				<h1 tabIndex={-1}>review-dashboard</h1>
				{dashboard && (
					<GroupingSelect
						grouping={viewSettings.grouping}
						onChange={setGrouping}
					/>
				)}
			</header>
			<main>
				{!dashboard ? (
					<TokenForm onSave={saveToken} unauthorized={unauthorized} onLogout={logout} />
				) : (
					<>
						<QueryBar query={state.query} onApply={applyQuery} />
						<StatusBar state={state} onRefresh={refresh} onLogout={logout} />
						<PullRequestList
							state={state}
							groups={groups}
							viewSettings={viewSettings}
							onSort={toggleSort}
						/>
					</>
				)}
			</main>
		</>
	);
}
