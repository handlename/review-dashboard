# review-dashboard

A browser-based dashboard that lists the GitHub pull requests waiting for your review.

It runs entirely in the browser as a static site hosted on GitHub Pages, and talks directly to the GitHub API using a Personal Access Token you provide.

> **Status:** Design phase. The documents below describe what will be built; there is no implementation yet.

## Features

- **Search-based list**: Shows PRs matching a GitHub search query. The default is `is:pr review-requested:@me state:open archived:false -is:draft`
- **Editable query**: Change the query at any time; it is kept in the page URL (`?q=...`), so you can bookmark it and open several queries at once
- **PR details at a glance**: PR number, title, repository, author, diff stat (+additions / -deletions / changed files), created and updated dates
- **Stack position**: PRs in a GitHub stacked PR show their position in the stack after the title (e.g. `2/3`)
- **Review status**: The latest review result for each reviewer (Approved / Changes requested / Commented / Dismissed)
- **Grouping and sorting**: Group by organization or repository (the grouped columns are hidden), and sort by clicking column headers
- **Instant display**: Cached results appear immediately on access, then refresh in the background
- **One click to GitHub**: Open any PR on GitHub in a new tab

## How it works

- Authentication uses a Personal Access Token entered in the app. There is no OAuth login and no backend
- PRs are fetched with the GitHub GraphQL API `search`
- The token, cached results, and view settings are stored in your browser's localStorage (the query lives in the URL), and are never sent anywhere except `api.github.com`
- Only github.com is supported (GitHub Enterprise Server is not)

### Token permissions

- **Classic PAT**: grant the `repo` scope to include private repositories
- **Fine-grained PAT**: works, but can access only one resource owner, so searches across multiple organizations return incomplete results

## Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md): Functional and non-functional requirements, and acceptance criteria
- [ARCHITECTURE.md](ARCHITECTURE.md): Architecture, data model, API usage, persistence, and security
- [UI_DESIGN.md](UI_DESIGN.md): Design tokens, screens, components, per-state display, and accessibility
- [GLOSSARY.md](GLOSSARY.md): Definitions of the terms used in this project

## Tech stack

TypeScript, React, and Vite, deployed to GitHub Pages with GitHub Actions.

## License

See [LICENSE](LICENSE).
