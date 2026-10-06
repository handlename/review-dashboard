import type { FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { WarningIcon } from "./icons";

export function TokenForm(props: {
	onSave(token: string): void;
	unauthorized: boolean;
	onLogout(): void;
	focusInput: boolean;
}) {
	const [value, setValue] = useState("");
	const [empty, setEmpty] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	useEffect(() => {
		if (props.focusInput) {
			inputRef.current?.focus();
		}
	}, [props.focusInput]);

	const error = empty
		? "Enter a token."
		: props.unauthorized
			? "Your token is invalid or expired."
			: null;

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
		<section className="token-form">
			<h2 className="token-heading">Enter a personal access token</h2>
			<p className="muted token-note">
				The token is stored only in this browser and sent only to
				api.github.com.
			</p>
			<form className="token-fields" onSubmit={handleSubmit} noValidate>
				{error !== null && (
					<p id={errorId} className="error-line">
						<WarningIcon />
						{error}
					</p>
				)}
				<label className="field-label" htmlFor={inputId}>
					Personal access token
				</label>
				<input
					ref={inputRef}
					id={inputId}
					className="input token-input"
					type="password"
					autoComplete="off"
					spellCheck={false}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					aria-invalid={error !== null || undefined}
					aria-describedby={error !== null ? errorId : undefined}
				/>
				<div className="token-actions">
					<button type="submit" className="button button-primary">
						<span>Save</span>
					</button>
					{props.unauthorized && (
						<button
							type="button"
							className="button button-secondary"
							onClick={props.onLogout}
						>
							<span>Log out</span>
						</button>
					)}
				</div>
			</form>
			<div className="muted token-permissions">
				<p>
					Classic token: grant the repo scope to include private repositories.
				</p>
				<p>
					Fine-grained token: can access only one resource owner, so searches
					across organizations may be incomplete.
				</p>
			</div>
		</section>
	);
}
