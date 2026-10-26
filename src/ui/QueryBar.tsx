import type { FormEvent } from "react";
import { useId, useState } from "react";
import type { SearchQuery } from "../domain/searchQuery";
import { DEFAULT_QUERY, createSearchQuery } from "../domain/searchQuery";

export function QueryBar(props: {
	query: SearchQuery;
	onApply(query: SearchQuery): void;
	open: boolean;
	onOpenChange(open: boolean): void;
}) {
	const [value, setValue] = useState<string>(props.query);
	// Follow query changes from outside the form, such as browser back/forward.
	const [shownQuery, setShownQuery] = useState(props.query);
	if (shownQuery !== props.query) {
		setShownQuery(props.query);
		setValue(props.query);
	}
	const empty = value.trim() === "";
	const summaryId = useId();
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
		<details
			className="query-bar"
			open={props.open}
			onToggle={(e) => props.onOpenChange(e.currentTarget.open)}
		>
			<summary id={summaryId} className="field-label query-summary">
				Search query
			</summary>
			<form className="query-form" onSubmit={handleSubmit} noValidate>
				<div className="query-row">
					<input
						aria-labelledby={summaryId}
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
		</details>
	);
}
