import { useCallback, useState } from "react";
import type { Grouping, SortKey, ViewSettings } from "../domain/viewSettings";
import { DEFAULT_VIEW_SETTINGS, toggleSort as toggleSortKey } from "../domain/viewSettings";
import { loadToken, loadViewSettings, saveToken as storeToken, saveViewSettings } from "../infra/storage";

export function useSettings() {
	const [token, setToken] = useState<string | null>(loadToken);
	const [viewSettings, setViewSettings] = useState<ViewSettings>(
		() => loadViewSettings() ?? DEFAULT_VIEW_SETTINGS,
	);

	const saveToken = useCallback((value: string) => {
		storeToken(value);
		setToken(value);
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

	return { token, saveToken, viewSettings, setGrouping, toggleSort };
}
