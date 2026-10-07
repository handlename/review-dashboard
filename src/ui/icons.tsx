import type { ReviewState } from "../domain/pullRequest";
import type { SortDirection } from "../domain/viewSettings";

const REVIEW_STATE_CLASS: Record<ReviewState, string> = {
	APPROVED: "review-icon-approved",
	CHANGES_REQUESTED: "review-icon-changes-requested",
	COMMENTED: "review-icon-commented",
	DISMISSED: "review-icon-dismissed",
};

function ReviewStateGlyph(props: { state: ReviewState }) {
	switch (props.state) {
		case "APPROVED":
			return (
				<path
					d="M3.5 6.2 5.2 7.9 8.6 4.3"
					fill="none"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			);
		case "CHANGES_REQUESTED":
			return (
				<path
					d="M3.5 6h5"
					fill="none"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			);
		case "COMMENTED":
			return (
				<path
					d="M3.5 3.8h5a.6.6 0 0 1 .6.6v2.6a.6.6 0 0 1-.6.6H6L4.3 8.9V7.6h-.8a.6.6 0 0 1-.6-.6V4.4a.6.6 0 0 1 .6-.6Z"
					stroke="none"
				/>
			);
		case "DISMISSED":
			return (
				<>
					<circle cx="6" cy="6" r="2.6" fill="none" strokeWidth="1.2" />
					<path d="M4.2 7.8 7.8 4.2" fill="none" strokeWidth="1.2" />
				</>
			);
	}
}

// The glyph is colored by the .review-icon-glyph class (fill/stroke) so it contrasts with the circle.
export function ReviewStateIcon(props: { state: ReviewState }) {
	return (
		<svg
			className={`review-icon ${REVIEW_STATE_CLASS[props.state]}`}
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="currentColor"
			aria-hidden="true"
		>
			<circle cx="6" cy="6" r="6" />
			<g className="review-icon-glyph">
				<ReviewStateGlyph state={props.state} />
			</g>
		</svg>
	);
}

export function SortIcon(props: { direction: SortDirection }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				d={
					props.direction === "asc"
						? "M8 4.5 12.5 10.5h-9Z"
						: "M8 11.5 3.5 5.5h9Z"
				}
			/>
		</svg>
	);
}

export function RefreshIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 2.5a5.5 5.5 0 0 1 4.6 2.5H10.5a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V2a.75.75 0 0 0-1.5 0v1.7A7 7 0 1 0 15 8a.75.75 0 0 0-1.5 0A5.5 5.5 0 1 1 8 2.5Z" />
		</svg>
	);
}

export function GearIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden="true"
		>
			{/* Eight teeth: a thick ring dashed into equal segments (circumference 2π × 6.25 / 16). */}
			<circle cx="8" cy="8" r="6.25" strokeWidth="2.5" strokeDasharray="2.454 2.454" />
			<circle cx="8" cy="8" r="4.5" />
			<circle cx="8" cy="8" r="1.75" />
		</svg>
	);
}

export function SpinnerIcon() {
	return (
		<svg
			className="spinner"
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 1.5A6.5 6.5 0 1 0 14.5 8H13a5 5 0 1 1-5-5Z" />
		</svg>
	);
}

export function StackIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M6 1 11 3.5 6 6 1 3.5Z" />
			<path d="M1 6 6 8.5 11 6" />
			<path d="M1 8.5 6 11 11 8.5" />
		</svg>
	);
}

export function ExternalLinkIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M2 2.75C2 2.34 2.34 2 2.75 2H5v1H3v6h6V7h1v2.25c0 .41-.34.75-.75.75h-7.5A.75.75 0 0 1 2 9.25Z" />
			<path d="M7 1.5h3.5V5h-1V3.2L6.35 6.35l-.7-.7L8.8 2.5H7Z" />
		</svg>
	);
}

export function WarningIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 6.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
		</svg>
	);
}

export function GhostIcon() {
	return (
		<svg
			className="avatar"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M10 0a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 1.5a8.5 8.5 0 0 0-6.1 14.4A7 7 0 0 1 10 12.5a7 7 0 0 1 6.1 3.4A8.5 8.5 0 0 0 10 1.5Zm0 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
		</svg>
	);
}
