import type { FormEvent } from "react";
import { useId, useRef, useState } from "react";

export function TokenForm(props: { onSave(token: string): void }) {
	const [value, setValue] = useState("");
	const [empty, setEmpty] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const token = value.trim();
		if (token === "") {
			setEmpty(true);
			inputRef.current?.focus();
			return;
		}
		props.onSave(token);
	}

	return (
		<section>
			<h2>Enter a personal access token</h2>
			<p>
				The token is stored only in this browser and sent only to
				api.github.com.
			</p>
			<form onSubmit={handleSubmit} noValidate>
				{empty && <p id={errorId}>Enter a token.</p>}
				<label htmlFor={inputId}>Personal access token</label>
				<input
					ref={inputRef}
					id={inputId}
					type="password"
					autoComplete="off"
					spellCheck={false}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					aria-invalid={empty || undefined}
					aria-describedby={empty ? errorId : undefined}
				/>
				<button type="submit">Save</button>
			</form>
			<p>
				Classic token: grant the repo scope to include private repositories.
			</p>
			<p>
				Fine-grained token: can access only one resource owner, so searches
				across organizations may be incomplete.
			</p>
		</section>
	);
}
