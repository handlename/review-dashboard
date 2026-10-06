import type { FormEvent } from "react";
import { useId, useState } from "react";
import type { SearchQuery } from "../domain/searchQuery";
import { DEFAULT_QUERY, createSearchQuery } from "../domain/searchQuery";

export function QueryBar(props: {
	query: SearchQuery;
	onApply(query: SearchQuery): void;
}) {
	const [value, setValue] = useState<string>(props.query);
	const empty = value.trim() === "";
	const inputId = useId();
	const helperId = useId();

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!empty) {
			props.onApply(createSearchQuery(value));
		}
	}

	function handleReset() {
		setValue(DEFAULT_QUERY);
		props.onApply(DEFAULT_QUERY);
	}

	return (
		<form onSubmit={handleSubmit} noValidate>
			<label htmlFor={inputId}>Search query</label>
			<input
				id={inputId}
				type="text"
				spellCheck={false}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				aria-invalid={empty || undefined}
				aria-describedby={empty ? helperId : undefined}
			/>
			<button type="submit" aria-disabled={empty || undefined}>
				Apply
			</button>
			<button type="button" onClick={handleReset}>
				Reset
			</button>
			{empty && <p id={helperId}>A search query is required.</p>}
		</form>
	);
}
