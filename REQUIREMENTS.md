# REQUIREMENTS

Requirements for review-dashboard.
See [GLOSSARY.md](GLOSSARY.md) for terminology and [ARCHITECTURE.md](ARCHITECTURE.md) for the design.

## Purpose

Let users see, on a single browser page, the pull requests they have been asked to review on GitHub.
Users browse the list of PRs matching a search query, check their review status, and open the PRs they want to work on.

## Scope

### In scope

- Listing PRs that match a single search query
- Editing and persisting the search query
- Showing PR information (number, title, author, diff stat, review results, created date, updated date)
- Grouping by organization/repository and sorting by column
- Caching fetch results and refreshing them in the background on access
- Automatic refresh at an interval the user chooses

### Out of scope

- Login via OAuth / GitHub App
- GitHub Enterprise Server support
- Saving or switching between multiple search queries
- Notifications
- Acting on PRs (submitting reviews, commenting, merging, etc.)
- Showing pending review requests (requested reviewers) or the PR-level review decision (reviewDecision)

## Functional requirements

### Authentication

| ID | Requirement |
|----|-------------|
| FR-AUTH-1 | When no PAT is set, show the PAT input screen. Saving a PAT starts fetching PRs |
| FR-AUTH-2 | The user can remove the PAT (log out) from the settings dialog. Logging out also discards the cache |
| FR-AUTH-3 | When the API returns 401, tell the user the PAT is invalid and prompt them to enter it again |

### Search query

| ID | Requirement |
|----|-------------|
| FR-QUERY-1 | When the page URL has no search query, use the default query `is:pr review-requested:@me state:open archived:false -is:draft` |
| FR-QUERY-2 | The user can edit and apply the search query. Applying it fetches PRs again |
| FR-QUERY-3 | The search query is kept in the page URL, so it persists across reloads, can be bookmarked, and pages with different search queries can be open at the same time. Browser back and forward restore the previous search query |
| FR-QUERY-4 | The user can reset the search query to the default query |
| FR-QUERY-5 | An empty search query cannot be applied |

### PR list

| ID | Requirement |
|----|-------------|
| FR-LIST-1 | For each PR, show the PR number, title, organization, repository, author, diff stat, created date, and updated date |
| FR-LIST-2 | Show the diff stat as added lines (+additions), deleted lines (-deletions), and the number of changed files |
| FR-LIST-3 | For each PR, show the latest review result per reviewer (Approved / Changes requested / Commented / Dismissed) |
| FR-LIST-4 | The PR page on GitHub can be opened in a new tab, e.g. from the PR title |
| FR-LIST-5 | The grouping can be chosen from "None", "Organization", and "Repository". The choice persists across reloads |
| FR-LIST-6 | Clicking a column header makes that column the sort key. Clicking the same column again reverses the sort direction (ascending/descending). The choice persists across reloads |
| FR-LIST-7 | The initial sort key is the updated date, and the initial sort direction is descending |
| FR-LIST-8 | Sortable columns are PR number, title, organization, repository, author, diff stat (additions + deletions), created date, and updated date |
| FR-LIST-9 | When grouped, the sort from FR-LIST-6 applies within each group. Groups are ordered by group name ascending, and each group heading shows its PR count |
| FR-LIST-10 | When the search returns no results, say so |
| FR-LIST-11 | When grouped, columns that repeat the group heading are hidden: the organization column when grouping by organization, and the organization and repository columns when grouping by repository |
| FR-LIST-12 | Draft PRs can be told apart from other PRs in the list. The default query excludes draft PRs, so this applies when the user's search query includes them |
| FR-LIST-13 | The created and updated dates can be shown either as absolute times or as times relative to now (e.g. "5 minutes ago"). The choice persists across reloads and logouts. Absolute times are the default |
| FR-LIST-14 | A PR that belongs to a GitHub stacked PR shows its position in the stack after the title, as `n/m` (n = position, m = number of PRs in the stack). Both numbers are GitHub's values as-is, regardless of which PRs of the stack are in the list |

### Cache

| ID | Requirement |
|----|-------------|
| FR-CACHE-1 | Store fetch results as caches, one per search query, for the five most recently fetched search queries |
| FR-CACHE-2 | On access, if a cache exists for the current search query, show it without waiting for the API response |
| FR-CACHE-3 | After showing the cache, automatically run a background refresh and replace the list when it completes |
| FR-CACHE-4 | The user can fetch PRs again at any time with a manual refresh button |
| FR-CACHE-5 | Show the last fetched time and whether a fetch is in progress |
| FR-CACHE-6 | The cache is tied to a search query. After the search query changes, do not show a cache for a different search query |
| FR-CACHE-7 | The user can choose an automatic refresh interval from Off, 1, 5, 10, and 30 minutes. Off is the default. The choice persists across reloads and logouts |
| FR-CACHE-8 | With automatic refresh on, PRs are fetched again when the interval has passed since the last fetch finished, whether it succeeded or failed. Automatic refresh stops after an invalid PAT or a rate limit error, and resumes after the next successful fetch |
| FR-CACHE-9 | With automatic refresh on, show roughly how long until the next automatic refresh |

### Settings

| ID | Requirement |
|----|-------------|
| FR-SET-1 | A settings dialog holds the time display (FR-LIST-13), the automatic refresh interval (FR-CACHE-7), and log out (FR-AUTH-2). Changes take effect and are saved immediately |

### Errors

| ID | Requirement |
|----|-------------|
| FR-ERR-1 | When a fetch fails (network error, rate limit, etc.), show what went wrong |
| FR-ERR-2 | Even when a fetch fails, keep showing the list if a cache exists |

## Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Works on the latest versions of major browsers (Chrome, Firefox, Safari, Edge) |
| NFR-2 | Consists only of static files and can be hosted on GitHub Pages. Requires no server or proxy of its own |
| NFR-3 | Connects only to github.com (`https://api.github.com`) |
| NFR-4 | The PAT, cache, and view settings are stored in the browser's localStorage, and the search query is kept in the page URL. No other data is sent anywhere |
| NFR-5 | Because the PAT is stored in the browser, no third-party scripts are loaded at runtime, and a CSP restricts connection destinations |
| NFR-6 | A single fetch handles at most the GitHub search API limit (1,000 results) |
| NFR-7 | Implemented with TypeScript, Vite, and React, built with GitHub Actions and deployed to GitHub Pages |

## Acceptance criteria

- [ ] On first visit the PAT input screen appears, and saving a PAT shows the results of the default query (FR-AUTH-1, FR-QUERY-1)
- [ ] Changing and applying the search query updates the list, and after a reload the new query and its results are shown (FR-QUERY-2, FR-QUERY-3, FR-CACHE-2)
- [ ] Each PR shows the information in FR-LIST-1 to FR-LIST-3, and clicking the title opens the PR in a new tab (FR-LIST-4)
- [ ] For a PR reviewed multiple times by the same reviewer, only the latest result is shown (FR-LIST-3)
- [ ] After changing the grouping and sort and reloading, the changed settings are kept (FR-LIST-5, FR-LIST-6)
- [ ] On subsequent visits the cache appears immediately and is then replaced by the latest results from the background refresh (FR-CACHE-2, FR-CACHE-3)
- [ ] When accessed with the network blocked, the cache stays visible and an error is shown (FR-ERR-1, FR-ERR-2)
- [ ] Logging out removes the PAT and the cache and returns to the PAT input screen (FR-AUTH-2)
- [ ] With a search query that includes draft PRs, draft PRs look different from other PRs (FR-LIST-12)
- [ ] Turning on relative times shows the created and updated dates relative to now, and the setting is kept after a reload (FR-LIST-13, FR-SET-1)
- [ ] A PR in a stacked PR shows its position as `n/m` after the title, matching GitHub, and a PR not in a stack shows none (FR-LIST-14)
- [ ] With automatic refresh on, PRs are fetched again after the interval, the time until the next refresh is visible, and a failed fetch is retried only after the next interval (FR-CACHE-7 to FR-CACHE-9)
- [ ] Saving an invalid PAT shows that the PAT is invalid (FR-AUTH-3)
