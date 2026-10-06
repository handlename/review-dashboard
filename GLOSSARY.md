# GLOSSARY

Definitions of the terms used in review-dashboard.
Written for developers implementing the app, it covers terms specific to this app and GitHub concepts that carry a specific meaning here.
Names in parentheses are code identifiers; `FR-*` / `NFR-*` refer to requirement IDs in [REQUIREMENTS.md](REQUIREMENTS.md).

## Search and fetch

### Search query (SearchQuery)

A string in GitHub search syntax that selects which PRs to show.
Each page holds exactly one search query, kept in the page URL, and an empty string is not allowed. (FR-QUERY-2, FR-QUERY-3, FR-QUERY-5)

### Default query (DEFAULT_QUERY)

The search query used when the page URL has none.
It matches open, non-draft PRs in non-archived repositories where your review is requested. (FR-QUERY-1)

```text
is:pr review-requested:@me state:open archived:false -is:draft
```

### PAT (token)

The Personal Access Token used to access the GitHub API.
The user enters it, and it is stored in the browser's localStorage. It is the app's only means of authentication. (FR-AUTH-1, NFR-4)

### Fetch (fetch)

Loading the PRs that match the search query from the GitHub API and updating the list and the cache.
It is triggered by saving a PAT, applying a search query, a background refresh, or a manual refresh.

### Background refresh

Fetching in the background while the cache stays on screen, then replacing the list when the fetch completes.
It runs automatically once on access, and again at every auto refresh. (FR-CACHE-3)

### Auto refresh

A background refresh that runs again after the interval the user chose in the settings dialog (Off, 1, 5, 10, or 30 minutes) has passed since the last fetch finished.
It stops after a rate limit error or an invalid PAT, and resumes after the next successful fetch.
While one is scheduled, a bar along the bottom of the refresh button shows how long remains. (FR-CACHE-7, FR-CACHE-8, FR-CACHE-9)

### Manual refresh

A fetch the user starts by pressing the refresh button. (FR-CACHE-4)

## PRs and reviews

### PR (PullRequest)

A single pull request shown in the list.
It has a PR number, title, draft flag, URL, repository, author, diff stat, created date, updated date, and a list of latest reviews. (FR-LIST-1)

### Draft (isDraft)

A PR marked as a draft on GitHub.
The default query excludes drafts; when the search query includes them, their rows are shown muted. (FR-LIST-12)

### Actor (Actor)

A GitHub user as shown in the app: a login and an avatar URL.
The avatar URL is absent unless it points to `avatars.githubusercontent.com`; the UI then shows a ghost.

### Author (author)

The GitHub user who opened the PR, as an actor (login and avatar).
It may be absent if the user account has been deleted.

### Diff stat (DiffStat)

The size of a PR's changes.
It consists of added lines (additions), deleted lines (deletions), and the number of changed files (changedFiles).
Sorting by diff stat uses the sum of added and deleted lines. (FR-LIST-2, FR-LIST-8)

### Review (Review)

A single evaluation a reviewer submitted on a PR.
It has a reviewer, a review result, and a submission time.

### Reviewer (reviewer)

A GitHub user who has submitted a review on the PR, as an actor (login and avatar).
It may be absent if the user account has been deleted.
Users and teams whose review was requested but who have not yet submitted a review are not treated as reviewers.

### Review result (ReviewState)

What a review concluded.
The app shows the following four values. (FR-LIST-3)

| Value | Label | Meaning |
|-------|-------|---------|
| `APPROVED` | Approved | Approved the PR |
| `CHANGES_REQUESTED` | Changes requested | Requested changes |
| `COMMENTED` | Commented | Commented without approving or requesting changes |
| `DISMISSED` | Dismissed | An earlier review was dismissed |

### Latest review (latestReview)

The review each reviewer submitted most recently.
A PR's review status is represented as its list of latest reviews, one per reviewer. (FR-LIST-3)

## List view

### Dashboard

The app's screen.
It consists of the search query input, the fetch status, and the PR list.

### Organization (owner)

The owner of a repository.
Besides a GitHub Organization, it refers to the user when the repository is owned by an individual. For `handlename/review-dashboard` it is `handlename`.

### Repository (repository)

The repository a PR belongs to.
It is identified by its `owner/name` form (nameWithOwner).

### Grouping (Grouping)

The unit by which the PR list is grouped.
One of `none` (no grouping), `owner` (by organization), or `repository` (by repository). The choice is kept as part of the view settings. (FR-LIST-5, FR-LIST-9)

### Sort key (SortKey)

The column used to order the PR list.
One of PR number, title, organization, repository, author, diff stat, created date, or updated date. The initial value is the updated date. (FR-LIST-6 to FR-LIST-8)

### Sort direction (SortDirection)

The direction of ordering by the sort key.
Either `asc` (ascending) or `desc` (descending); the initial value is `desc`. (FR-LIST-6, FR-LIST-7)

### Relative time

A created or updated date shown relative to now, such as "5 minutes ago", instead of as an absolute date and time.
Turned on in the settings dialog. (FR-LIST-13)

## UI

Terms from [UI_DESIGN.md](UI_DESIGN.md).

### Settings dialog

The dialog opened from the Settings button in the header. It holds the relative time switch, the auto refresh interval, and log out. (FR-SET-1)

### Design token

A named CSS custom property (`--rd-*`) that holds one visual value, such as a color, font size, or spacing.
Color tokens have one value per theme.

### Theme

The light or dark set of color token values.
It follows the OS setting (`prefers-color-scheme`); there is no manual switch.

### Review badge

The mark for one latest review: the reviewer's avatar with a review state icon over its corner.
The reviewer and the review result are given in its tooltip and accessible name. (FR-LIST-3)

### State matrix

The table in UI_DESIGN.md that fixes what each screen area shows in each state of the fetch flow.

### Ghost

The placeholder shown instead of a user's avatar and login when the user account has been deleted or the avatar cannot be shown.

## Persistence

### Cache (Cache)

The result of the last successful fetch for one search query.
It has a search query, a last fetched time, and a list of PRs. Caches for the five most recently fetched search queries are kept.
A cache that does not match the current search query is not shown. (FR-CACHE-1, FR-CACHE-6)

### Last fetched time (fetchedAt)

When the cache's contents were fetched.
It is shown on screen to indicate how fresh the list is. (FR-CACHE-5)

### View settings (ViewSettings)

The combination of grouping, sort key, sort direction, whether relative times are shown, and the auto refresh interval.
Stored in localStorage and kept across reloads and logouts.

### Log out

Removing the PAT and the caches from localStorage and returning to the PAT input screen.
Started from the settings dialog, or from the PAT input screen in the Unauthorized state.
The view settings are not removed, and the search query stays in the page URL. (FR-AUTH-2)
