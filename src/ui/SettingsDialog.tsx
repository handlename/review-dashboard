import type { RefObject } from "react";
import { useId } from "react";
import type { AutoRefreshMinutes } from "../domain/viewSettings";
import { AUTO_REFRESH_MINUTES, isAutoRefreshMinutes } from "../domain/viewSettings";
import { formatMinutes } from "./format";

// Opened by the caller with dialogRef.current.showModal(). Open state lives only in the <dialog>,
// so closing with Esc needs no React state to stay in sync.
export function SettingsDialog(props: {
	dialogRef: RefObject<HTMLDialogElement | null>;
	relativeTime: boolean;
	autoRefreshMinutes: AutoRefreshMinutes;
	onRelativeTimeChange(relativeTime: boolean): void;
	onAutoRefreshMinutesChange(minutes: AutoRefreshMinutes): void;
	onLogout(): void;
}) {
	const headingId = useId();
	const autoRefreshId = useId();
	const logoutHintId = useId();
	const close = () => props.dialogRef.current?.close();

	return (
		<dialog ref={props.dialogRef} className="settings-dialog" aria-labelledby={headingId}>
			<h2 id={headingId} className="settings-heading">
				Settings
			</h2>
			<div className="settings-field">
				{/* Wrapping the input makes the gap between it and the text clickable too. */}
				<label className="settings-checkbox">
					<input
						type="checkbox"
						checked={props.relativeTime}
						onChange={(e) => props.onRelativeTimeChange(e.target.checked)}
					/>
					Show relative times
				</label>
			</div>
			<div className="settings-field">
				<label className="field-label" htmlFor={autoRefreshId}>
					Auto refresh
				</label>
				<select
					id={autoRefreshId}
					className="select"
					value={props.autoRefreshMinutes}
					onChange={(e) => {
						const minutes = Number(e.target.value);
						if (isAutoRefreshMinutes(minutes)) {
							props.onAutoRefreshMinutesChange(minutes);
						}
					}}
				>
					{AUTO_REFRESH_MINUTES.map((minutes) => (
						<option key={minutes} value={minutes}>
							{minutes === 0 ? "Off" : formatMinutes(minutes)}
						</option>
					))}
				</select>
			</div>
			<div className="settings-footer">
				<p id={logoutHintId} className="muted">
					Logging out removes the saved token and cached results from this browser.
				</p>
				<div className="settings-actions">
					<button
						type="button"
						className="button button-secondary button-danger"
						aria-describedby={logoutHintId}
						onClick={() => {
							close();
							props.onLogout();
						}}
					>
						<span>Log out</span>
					</button>
					<button type="button" className="button button-primary" onClick={close}>
						<span>Close</span>
					</button>
				</div>
			</div>
		</dialog>
	);
}
