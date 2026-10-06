export type Grouping = "none" | "owner" | "repository";
export type SortKey =
	| "number"
	| "title"
	| "owner"
	| "repository"
	| "author"
	| "diff"
	| "createdAt"
	| "updatedAt";
export type SortDirection = "asc" | "desc";

// 0 means auto refresh is off.
export const AUTO_REFRESH_MINUTES = [0, 1, 5, 10, 30] as const;
export type AutoRefreshMinutes = (typeof AUTO_REFRESH_MINUTES)[number];

export function isAutoRefreshMinutes(value: unknown): value is AutoRefreshMinutes {
	return AUTO_REFRESH_MINUTES.includes(value as AutoRefreshMinutes);
}

export type ViewSettings = {
	readonly grouping: Grouping;
	readonly sortKey: SortKey;
	readonly sortDirection: SortDirection;
	readonly relativeTime: boolean;
	readonly autoRefreshMinutes: AutoRefreshMinutes;
};

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
	grouping: "none",
	sortKey: "updatedAt",
	sortDirection: "desc",
	relativeTime: false,
	autoRefreshMinutes: 0,
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
