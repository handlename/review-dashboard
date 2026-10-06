import type { FormEvent } from "react";
import { useId, useRef, useState } from "react";

export function TokenForm(props: { onSave(token: string): void; unauthorized: boolean; onLogout(): void }) {
	const [value, setValue] = useState("");
	const [empty, setEmpty] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	const error = empty ? "Enter a token." : props.unauthorized ? "Your token is invalid or expired." : null;

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
				{error !== null && <p id={errorId}>{error}</p>}
				<label htmlFor={inputId}>Personal access token</label>
				<input
					ref={inputRef}
					id={inputId}
					type="password"
					autoComplete="off"
					spellCheck={false}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					aria-invalid={error !== null || undefined}
					aria-describedby={error !== null ? errorId : undefined}
				/>
				<button type="submit">Save</button>
				{props.unauthorized && (
					<button type="button" onClick={props.onLogout}>
						Log out
					</button>
				)}
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
