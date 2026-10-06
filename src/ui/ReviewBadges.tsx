import type { Review, ReviewState } from "../domain/pullRequest";

const REVIEW_STATE_LABELS: Record<ReviewState, string> = {
	APPROVED: "Approved",
	CHANGES_REQUESTED: "Changes requested",
	COMMENTED: "Commented",
	DISMISSED: "Dismissed",
};

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
	return (
		<ul>
			{reviews.map((review, i) => (
				<li key={i}>
					{review.reviewer?.login ?? "ghost"}:{" "}
					{REVIEW_STATE_LABELS[review.state]}
				</li>
			))}
		</ul>
	);
}
