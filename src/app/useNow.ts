import { useLayoutEffect, useState } from "react";

const INTERVAL_MS = 60_000;

// The current time, refreshed every minute while enabled; null while disabled.
export function useNow(enabled: boolean): Date | null {
	const [now, setNow] = useState<Date | null>(null);
	// A layout effect so turning it on never paints a stale or missing time.
	useLayoutEffect(() => {
		if (!enabled) {
			return;
		}
		setNow(new Date());
		const id = setInterval(() => setNow(new Date()), INTERVAL_MS);
		return () => clearInterval(id);
	}, [enabled]);
	return enabled ? now : null;
}
