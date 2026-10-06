import { useState } from "react";
import type { Actor, Review, ReviewState } from "../domain/pullRequest";
import { GhostIcon, ReviewStateIcon } from "./icons";

const REVIEW_STATE_LABELS: Record<ReviewState, string> = {
	APPROVED: "Approved",
	CHANGES_REQUESTED: "Changes requested",
	COMMENTED: "Commented",
	DISMISSED: "Dismissed",
};

const MAX_BADGES = 6;

export function loginOf(actor: Actor | null): string {
	return actor?.login ?? "ghost";
}

function AvatarImage(props: { url: string }) {
	const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
		"loading",
	);
	if (status === "failed") {
		return <GhostIcon />;
	}
	return (
		<span className="avatar avatar-placeholder">
			<img
				className={
					status === "loaded" ? "avatar-image is-loaded" : "avatar-image"
				}
				src={props.url}
				alt=""
				referrerPolicy="no-referrer"
				width="20"
				height="20"
				onLoad={() => setStatus("loaded")}
				onError={() => setStatus("failed")}
			/>
		</span>
	);
}

export function Avatar(props: { actor: Actor | null }) {
	const url = props.actor?.avatarUrl ?? null;
	return url === null ? <GhostIcon /> : <AvatarImage key={url} url={url} />;
}

const describe = (review: Review) =>
	`${loginOf(review.reviewer)}: ${REVIEW_STATE_LABELS[review.state]}`;

export function ReviewBadges(props: { reviews: readonly Review[] }) {
	if (props.reviews.length === 0) {
		return (
			<>
				<span aria-hidden="true">—</span>
				<span className="visually-hidden">No reviews</span>
			</>
		);
	}

	const reviews = [...props.reviews].sort(
		(a, b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt),
	);
	const shown =
		reviews.length > MAX_BADGES ? reviews.slice(0, MAX_BADGES - 1) : reviews;
	const hidden = reviews.slice(shown.length);
	const hiddenLabel = hidden.map(describe).join(", ");

	return (
		<ul className="review-badges">
			{shown.map((review, i) => (
				<li key={i}>
					<span
						className="review-badge"
						role="img"
						aria-label={describe(review)}
						title={describe(review)}
					>
						<Avatar actor={review.reviewer} />
						<ReviewStateIcon state={review.state} />
					</span>
				</li>
			))}
			{hidden.length > 0 && (
				<li>
					<span
						className="review-badge-more"
						role="img"
						aria-label={hiddenLabel}
						title={hiddenLabel}
					>
						+{hidden.length}
					</span>
				</li>
			)}
		</ul>
	);
}
