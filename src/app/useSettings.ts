import { useCallback, useState } from "react";
import type { AutoRefreshMinutes, Grouping, SortKey, ViewSettings } from "../domain/viewSettings";
import { DEFAULT_VIEW_SETTINGS, toggleSort as toggleSortKey } from "../domain/viewSettings";
import { clearSession, loadToken, loadViewSettings, saveToken as storeToken, saveViewSettings } from "../infra/storage";

export function useSettings() {
	const [token, setToken] = useState<string | null>(loadToken);
	const [viewSettings, setViewSettings] = useState<ViewSettings>(
		() => loadViewSettings() ?? DEFAULT_VIEW_SETTINGS,
	);

	const saveToken = useCallback((value: string) => {
		storeToken(value);
		setToken(value);
	}, []);

	const logout = useCallback(() => {
		clearSession();
		setToken(null);
	}, []);

	const updateViewSettings = useCallback((next: ViewSettings) => {
		saveViewSettings(next);
		setViewSettings(next);
	}, []);

	const setGrouping = useCallback(
		(grouping: Grouping) => updateViewSettings({ ...viewSettings, grouping }),
		[viewSettings, updateViewSettings],
	);

	const toggleSort = useCallback(
		(key: SortKey) => updateViewSettings(toggleSortKey(viewSettings, key)),
		[viewSettings, updateViewSettings],
	);

	const setRelativeTime = useCallback(
		(relativeTime: boolean) => updateViewSettings({ ...viewSettings, relativeTime }),
		[viewSettings, updateViewSettings],
	);

	const setAutoRefreshMinutes = useCallback(
		(autoRefreshMinutes: AutoRefreshMinutes) => updateViewSettings({ ...viewSettings, autoRefreshMinutes }),
		[viewSettings, updateViewSettings],
	);

	return {
		token,
		saveToken,
		logout,
		viewSettings,
		setGrouping,
		toggleSort,
		setRelativeTime,
		setAutoRefreshMinutes,
	};
}
