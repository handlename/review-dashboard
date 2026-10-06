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
		<form className="query-bar" onSubmit={handleSubmit} noValidate>
			<label className="field-label" htmlFor={inputId}>
				Search query
			</label>
			<div className="query-row">
				<input
					id={inputId}
					className="input query-input"
					type="text"
					spellCheck={false}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					aria-invalid={empty || undefined}
					aria-describedby={empty ? helperId : undefined}
				/>
				<button
					type="submit"
					className="button button-primary"
					aria-disabled={empty || undefined}
				>
					<span>Apply</span>
				</button>
				<button
					type="button"
					className="button button-secondary"
					onClick={handleReset}
				>
					<span>Reset</span>
				</button>
			</div>
			{empty && (
				<p id={helperId} className="helper-text">
					A search query is required.
				</p>
			)}
		</form>
	);
}
