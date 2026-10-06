export type Grouping = "none" | "owner" | "repository";
export type SortKey =
	| "number"
	| "title"
	| "repository"
	| "author"
	| "diff"
	| "createdAt"
	| "updatedAt";
export type SortDirection = "asc" | "desc";

export type ViewSettings = {
	readonly grouping: Grouping;
	readonly sortKey: SortKey;
	readonly sortDirection: SortDirection;
};

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
	grouping: "none",
	sortKey: "updatedAt",
	sortDirection: "desc",
};

// Switching to another column keeps the current direction.
export function toggleSort(settings: ViewSettings, key: SortKey): ViewSettings {
	if (settings.sortKey !== key) {
		return { ...settings, sortKey: key };
	}
	return {
		...settings,
		sortDirection: settings.sortDirection === "asc" ? "desc" : "asc",
	};
}
