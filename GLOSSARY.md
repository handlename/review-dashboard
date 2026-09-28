# GLOSSARY

Definitions of the terms used in review-dashboard.
Written for developers implementing the app, it covers terms specific to this app and GitHub concepts that carry a specific meaning here.
Names in parentheses are code identifiers; `FR-*` / `NFR-*` refer to requirement IDs in [REQUIREMENTS.md](REQUIREMENTS.md).

## Search and fetch

### Search query (SearchQuery)

A string in GitHub search syntax that selects which PRs to show.
The app always holds exactly one search query, and an empty string is not allowed. (FR-QUERY-2, FR-QUERY-5)

### Default query (DEFAULT_QUERY)

The search query used when none has been saved.
It matches open PRs in non-archived repositories where your review is requested. (FR-QUERY-1)

```text
is:pr review-requested:@me state:open archived:false
```

### PAT (token)

The Personal Access Token used to access the GitHub API.
The user enters it, and it is stored in the browser's localStorage. It is the app's only means of authentication. (FR-AUTH-1, NFR-4)

### Fetch (fetch)

Loading the PRs that match the search query from the GitHub API and updating the list and the cache.
It is triggered by saving a PAT, applying a search query, a background refresh, or a manual refresh.

### Background refresh

Fetching in the background while the cache stays on screen, then replacing the list when the fetch completes.
It runs automatically once on access and never periodically. (FR-CACHE-3)

### Manual refresh

A fetch the user starts by pressing the refresh button. (FR-CACHE-4)

## PRs and reviews

### PR (PullRequest)

A single pull request shown in the list.
It has a PR number, title, URL, repository, author, diff stat, created date, updated date, and a list of latest reviews. (FR-LIST-1)

### Author (author)

The GitHub user who opened the PR.
It may be absent if the user account has been deleted.

### Diff stat (DiffStat)

The size of a PR's changes.
It consists of added lines (additions), deleted lines (deletions), and the number of changed files (changedFiles).
Sorting by diff stat uses the sum of added and deleted lines. (FR-LIST-2, FR-LIST-8)

### Review (Review)

A single evaluation a reviewer submitted on a PR.
It has a reviewer, a review result, and a submission time.

### Reviewer (reviewer)

A GitHub user who has submitted a review on the PR.
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
One of PR number, title, repository, author, diff stat, created date, or updated date. The initial value is the updated date. (FR-LIST-6 to FR-LIST-8)

### Sort direction (SortDirection)

The direction of ordering by the sort key.
Either `asc` (ascending) or `desc` (descending); the initial value is `desc`. (FR-LIST-6, FR-LIST-7)

## Persistence

### Cache (Cache)

The result of the last successful fetch.
It has a search query, a last fetched time, and a list of PRs, and it is tied to its search query.
A cache that does not match the current search query is not shown. (FR-CACHE-1, FR-CACHE-6)

### Last fetched time (fetchedAt)

When the cache's contents were fetched.
It is shown on screen to indicate how fresh the list is. (FR-CACHE-5)

### View settings (ViewSettings)

The combination of grouping, sort key, and sort direction.
Stored in localStorage and kept across reloads.

### Log out

Removing the PAT and the cache from localStorage and returning to the PAT input screen.
The search query and view settings are not removed. (FR-AUTH-2)
