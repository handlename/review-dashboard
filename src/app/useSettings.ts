import { useCallback, useState } from "react";
import { loadToken, saveToken as storeToken } from "../infra/storage";

export function useSettings() {
	const [token, setToken] = useState<string | null>(loadToken);

	const saveToken = useCallback((value: string) => {
		storeToken(value);
		setToken(value);
	}, []);

	return { token, saveToken };
}
