const pad = (n: number) => String(n).padStart(2, "0");

// Built from local-time getters because toLocaleString varies by locale.
export function formatDateTime(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const numberFormat = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
	return numberFormat.format(n);
}

export function formatFileCount(n: number): string {
	return n === 1 ? "1 file" : `${formatNumber(n)} files`;
}
