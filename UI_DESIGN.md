# UI_DESIGN

UI design for review-dashboard.
See [REQUIREMENTS.md](REQUIREMENTS.md) for requirements, [ARCHITECTURE.md](ARCHITECTURE.md) for the design, and [GLOSSARY.md](GLOSSARY.md) for terminology.

## Overview

This document fixes every visual and interaction decision needed to implement the `ui/` components in [ARCHITECTURE.md](ARCHITECTURE.md#directory-layout).
Requirements are referenced by ID (`FR-*` / `NFR-*`) and are not restated here.

- The look follows GitHub's Primer design language, but all values are defined here as design tokens. No Primer package is used
- The layout is optimized for desktop browsers 1024px wide or more
- Light and dark themes follow the OS setting (`prefers-color-scheme`); there is no manual switch
- The target is WCAG 2.2 Level AA in both themes

Rules for this document:

- What each state displays is written only in [States](#states). Component sections describe elements and how they behave, and link to the state matrix instead of repeating it
- In tables, a row-heading cell holds a bare identifier (no backticks, no bold). The exception is design token names in [Color tokens](#color-tokens) and [Contrast](#contrast), which are written as full custom property names in backticks
- All user-facing text is English

## Foundations

Design tokens are CSS custom properties named `--rd-<category>-<role>[-<variant>]` in lowercase kebab case.
They are declared on `:root` in a single stylesheet bundled at build time.

### Themes

- Declare `:root { color-scheme: light dark; }` so native controls (scroll bars, `<input>`, `<select>`) follow the theme
- Light values are the defaults on `:root`. Dark values override them inside `@media (prefers-color-scheme: dark)`
- Only color tokens change between themes. Typography, spacing, radius, and border tokens are shared

### Color tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--rd-color-fg-default` | #1f2328 | #e6edf3 | Body text, table cells, headings |
| `--rd-color-fg-muted` | #59636e | #9198a1 | Secondary text: login under avatars, file count, group count, helper text, placeholder |
| `--rd-color-fg-on-emphasis` | #ffffff | #ffffff | Text and glyphs on emphasis fills (primary button, review state icons) |
| `--rd-color-canvas-default` | #ffffff | #0d1117 | Page background, input background, ring around review state icons |
| `--rd-color-canvas-subtle` | #f6f8fa | #151b23 | Table header background, secondary button background |
| `--rd-color-canvas-inset` | #eff2f5 | #010409 | Avatar placeholder before the image loads, draft row background |
| `--rd-color-row-hover` | #f0f3f6 | #1c222b | Table row background on hover |
| `--rd-color-border-default` | #d1d9e0 | #3d444d | Decorative rules: table row separators, section dividers |
| `--rd-color-border-control` | #818b98 | #656c76 | Boundaries of inputs, selects, and secondary buttons |
| `--rd-color-accent-fg` | #0969da | #4493f8 | Links (PR title) |
| `--rd-color-accent-emphasis` | #0969da | #1f6feb | Primary button background |
| `--rd-color-success-fg` | #1a7f37 | #3fb950 | Added lines in the diff stat |
| `--rd-color-success-emphasis` | #1f883d | #238636 | APPROVED icon fill |
| `--rd-color-danger-fg` | #d1242f | #f85149 | Deleted lines in the diff stat, error text, the danger button label |
| `--rd-color-danger-emphasis` | #cf222e | #da3633 | CHANGES_REQUESTED icon fill |
| `--rd-color-neutral-emphasis` | #59636e | #656c76 | COMMENTED and DISMISSED icon fill |
| `--rd-color-focus` | #0969da | #1f6feb | Focus ring |
| `--rd-color-backdrop` | #1f232880 | #010409cc | Backdrop behind the settings dialog (translucent; no contrast requirement) |

### Contrast

Ratios are WCAG 2.x contrast ratios, truncated to two decimals.
Pass or fail is judged on the untruncated value, and the table is checked by the script in [Appendix: Contrast check script](#appendix-contrast-check-script).
Thresholds: `4.5` for text (1.4.3), `3` for non-text such as icons, the focus ring, and control boundaries (1.4.11).
Decorative rules are not required to meet a threshold.

| Foreground | Background | Light | Dark | Threshold |
|---|---|---|---|---|
| `--rd-color-fg-default` | `--rd-color-canvas-default` | 15.79 | 16.01 | 4.5 |
| `--rd-color-fg-default` | `--rd-color-canvas-subtle` | 14.83 | 14.65 | 4.5 |
| `--rd-color-fg-default` | `--rd-color-row-hover` | 14.18 | 13.53 | 4.5 |
| `--rd-color-fg-muted` | `--rd-color-canvas-default` | 6.11 | 6.49 | 4.5 |
| `--rd-color-fg-muted` | `--rd-color-canvas-subtle` | 5.74 | 5.94 | 4.5 |
| `--rd-color-fg-muted` | `--rd-color-row-hover` | 5.48 | 5.49 | 4.5 |
| `--rd-color-fg-muted` | `--rd-color-canvas-inset` | 5.44 | 7.05 | 4.5 |
| `--rd-color-accent-fg` | `--rd-color-canvas-default` | 5.19 | 6.10 | 4.5 |
| `--rd-color-accent-fg` | `--rd-color-canvas-subtle` | 4.87 | 5.58 | 4.5 |
| `--rd-color-accent-fg` | `--rd-color-row-hover` | 4.66 | 5.15 | 4.5 |
| `--rd-color-success-fg` | `--rd-color-canvas-default` | 5.07 | 7.44 | 4.5 |
| `--rd-color-success-fg` | `--rd-color-canvas-subtle` | 4.77 | 6.81 | 4.5 |
| `--rd-color-success-fg` | `--rd-color-row-hover` | 4.56 | 6.29 | 4.5 |
| `--rd-color-danger-fg` | `--rd-color-canvas-default` | 5.24 | 5.64 | 4.5 |
| `--rd-color-danger-fg` | `--rd-color-canvas-subtle` | 4.92 | 5.16 | 4.5 |
| `--rd-color-danger-fg` | `--rd-color-row-hover` | 4.70 | 4.77 | 4.5 |
| `--rd-color-fg-on-emphasis` | `--rd-color-accent-emphasis` | 5.19 | 4.63 | 4.5 |
| `--rd-color-fg-on-emphasis` | `--rd-color-success-emphasis` | 4.51 | 4.63 | 3 |
| `--rd-color-fg-on-emphasis` | `--rd-color-danger-emphasis` | 5.35 | 4.60 | 3 |
| `--rd-color-fg-on-emphasis` | `--rd-color-neutral-emphasis` | 6.11 | 5.30 | 3 |
| `--rd-color-success-emphasis` | `--rd-color-canvas-default` | 4.51 | 4.08 | 3 |
| `--rd-color-success-emphasis` | `--rd-color-row-hover` | 4.05 | 3.45 | 3 |
| `--rd-color-danger-emphasis` | `--rd-color-canvas-default` | 5.35 | 4.10 | 3 |
| `--rd-color-danger-emphasis` | `--rd-color-row-hover` | 4.80 | 3.47 | 3 |
| `--rd-color-neutral-emphasis` | `--rd-color-canvas-default` | 6.11 | 3.56 | 3 |
| `--rd-color-neutral-emphasis` | `--rd-color-row-hover` | 5.48 | 3.01 | 3 |
| `--rd-color-focus` | `--rd-color-canvas-default` | 5.19 | 4.08 | 3 |
| `--rd-color-focus` | `--rd-color-canvas-subtle` | 4.87 | 3.73 | 3 |
| `--rd-color-focus` | `--rd-color-row-hover` | 4.66 | 3.45 | 3 |
| `--rd-color-border-control` | `--rd-color-canvas-default` | 3.45 | 3.56 | 3 |
| `--rd-color-border-default` | `--rd-color-canvas-default` | 1.42 | 1.92 | decorative |

Placeholder text uses `--rd-color-fg-muted` on the input background `--rd-color-canvas-default`, which is covered by the row above.

### Review states

Each review result (ReviewState) is shown as a 12px icon: a filled circle in the state's emphasis color with a glyph drawn in `--rd-color-fg-on-emphasis`.
States are told apart by glyph shape, not by color alone (1.4.1); COMMENTED and DISMISSED share a color and differ only in shape.

| State | Shape | Color | Label |
|---|---|---|---|
| APPROVED | Check mark | `--rd-color-success-emphasis` | Approved |
| CHANGES_REQUESTED | Horizontal bar (minus) | `--rd-color-danger-emphasis` | Changes requested |
| COMMENTED | Speech bubble | `--rd-color-neutral-emphasis` | Commented |
| DISMISSED | Circle with a diagonal slash | `--rd-color-neutral-emphasis` | Dismissed |

The Label column is the text used in accessible names and tooltips, and matches [GLOSSARY.md](GLOSSARY.md#review-result-reviewstate).

### Typography

| Token | Value |
|---|---|
| `--rd-font-family-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif` |
| `--rd-font-family-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` |
| `--rd-font-size-100` | 12px |
| `--rd-font-size-200` | 14px |
| `--rd-font-size-300` | 16px |
| `--rd-font-size-400` | 20px |
| `--rd-font-size-500` | 24px |
| `--rd-line-height-tight` | 1.25 |
| `--rd-line-height-default` | 1.5 |
| `--rd-font-weight-normal` | 400 |
| `--rd-font-weight-semibold` | 600 |

- Body text is `--rd-font-family-sans` at `--rd-font-size-200` with `--rd-line-height-default`
- The app title (`<h1>`) is `--rd-font-size-400` semibold; group headings (`<h2>`) are `--rd-font-size-300` semibold; the PAT input screen heading (`<h2>`) is `--rd-font-size-500` semibold. Headings use `--rd-line-height-tight`
- Numeric cells (PR number, diff stat, dates) use `font-variant-numeric: tabular-nums` so digits line up
- The search query input uses `--rd-font-family-mono`, because the query is GitHub search syntax
- Only the OS font stacks above are used, following the decision to avoid web fonts and extra assets

### Spacing

| Token | Value |
|---|---|
| `--rd-space-0` | 0 |
| `--rd-space-1` | 4px |
| `--rd-space-2` | 8px |
| `--rd-space-3` | 12px |
| `--rd-space-4` | 16px |
| `--rd-space-5` | 24px |
| `--rd-space-6` | 32px |
| `--rd-space-7` | 40px |

### Radius and border

| Token | Value | Usage |
|---|---|---|
| `--rd-radius-medium` | 6px | Buttons, inputs, selects, the table container, the stack badge |
| `--rd-radius-full` | 50% | Avatars, review state icons |
| `--rd-border-width-thin` | 1px | Control boundaries and decorative rules |
| `--rd-border-width-focus` | 2px | Focus ring |
| `--rd-control-height` | 32px | Minimum height of buttons, inputs, and selects |

Buttons:

| Variant | Background | Text | Border | Used for |
|---|---|---|---|---|
| Primary | `--rd-color-accent-emphasis` | `--rd-color-fg-on-emphasis` | none | Save, Apply |
| Secondary | `--rd-color-canvas-subtle` | `--rd-color-fg-default` | `--rd-border-width-thin` `--rd-color-border-control` | Reset, Refresh, Settings, Log out on the PAT input screen |
| Danger | `--rd-color-canvas-subtle` | `--rd-color-danger-fg` | `--rd-border-width-thin` `--rd-color-border-control` | Log out in SettingsDialog, which removes a working PAT |

- Buttons have `min-height: var(--rd-control-height)`, horizontal padding `--rd-space-3`, `--rd-radius-medium`, and semibold `--rd-font-size-200` text
- A button with `aria-disabled="true"` keeps its colors and gets `cursor: not-allowed` and 60% opacity on its label only; it stays focusable

### Iconography

- Icons are 16px square (`viewBox="0 0 16 16"`) unless stated otherwise, drawn as SVG elements written directly in JSX with `fill="currentColor"`
- Icons are decorative (`aria-hidden="true"`) unless listed with an accessible name below
- Shapes are original to this project; no icon set is copied or installed. See [Constraints checklist](#constraints-checklist)

| Icon | Shape | Where |
|---|---|---|
| Review state | See [Review states](#review-states); 12px | ReviewBadges |
| Sort ascending | Upward triangle | Active sort column header |
| Sort descending | Downward triangle | Active sort column header |
| Refresh | Circular arrow | Refresh button |
| Settings | Gear: a ring with eight square teeth and a hole in the center, drawn with strokes | Settings button |
| Spinner | Three-quarter circle arc that rotates once per second | StatusBar while fetching |
| External link | Square with an arrow leaving its top-right corner; 12px | After the PR title |
| Stack | Three stacked layers: a diamond with two chevrons below it, drawn with strokes; 12px | Stack badge |
| Warning | Circle with an exclamation mark | Before error messages |
| Ghost | Head-and-shoulders silhouette inside a circle; drawn at avatar size | Missing or failed avatars |

- When `prefers-reduced-motion: reduce` is set, the spinner does not rotate and the auto refresh bar grows in ten steps instead of continuously

### Layout

| Token | Value | Usage |
|---|---|---|
| `--rd-layout-max-width` | 1280px | Maximum width of the page content |
| `--rd-layout-gutter` | 24px | Left and right page padding |
| `--rd-table-min-width` | 1024px | Minimum width of the PR table |

- The layout is designed for viewports 1024px wide or more. At 1024px the content is 976px wide, so the ungrouped table scrolls by 48px; grouped tables hide columns and fit
- Only the PR table has a minimum width: `<table>` gets `min-width: var(--rd-table-min-width)` and its wrapper gets `overflow-x: auto`, so narrow viewports scroll the table horizontally. A data table is an exception in 1.4.10 Reflow
- Everything outside the table (header, QueryBar, StatusBar, PAT input screen) uses `flex-wrap: wrap` and stays usable without horizontal scrolling down to a 320px viewport (1.4.10)
- No element is sticky or fixed
- Heights are set with `min-height`, never `height`, so text resizing and spacing overrides do not clip content (1.4.4, 1.4.12)

## Screens

### PAT input screen

Shown when no PAT is saved, and in the Unauthorized state (FR-AUTH-1, FR-AUTH-3).
The content is a single column with `max-width: 480px`, centered horizontally, with `--rd-space-7` above it.

```text
+--------------------------------------------------------------------------+
| review-dashboard                                          [h1, size-400] |  header, min-height 56px, padding 0 gutter
+--------------------------------------------------------------------------+
|                                                                          |  space-7
|            Enter a personal access token              [h2, size-500]     |
|            The token is stored only in this browser   [fg-muted]         |  space-2
|            and sent only to api.github.com.                              |
|                                                                          |  space-5
|            (!) Your token is invalid or expired.      [danger-fg]        |  Unauthorized only
|            Personal access token                      [label, semibold]  |  space-1
|            [******************************        ]   [input, 100%]      |
|            [ Save ]  [ Log out ]                      [primary, second.] |  space-3; Log out: Unauthorized only
|                                                                          |  space-5
|            Classic token: grant the repo scope to     [fg-muted, 200]    |
|            include private repositories.                                 |
|            Fine-grained token: can access only one                       |
|            resource owner, so searches across                            |
|            organizations may be incomplete.                              |
+--------------------------------------------------------------------------+
```

- The permission notes are the text from [ARCHITECTURE.md](ARCHITECTURE.md#pat-permissions), shown on every visit to this screen
- The error line appears in the Unauthorized state, or after pressing Save with an empty input; see [TokenForm](#tokenform)

### Dashboard

Shown when a PAT is saved and the state is not Unauthorized.

```text
+----------------------------------------------------------------------------------------------+
| review-dashboard                                         Group by [ Repository v ]  [ (*) ]  |  App header, min-height 56px; (*) = Settings
+----------------------------------------------------------------------------------------------+
| Search query                                                                                 |  QueryBar, padding space-4 gutter
| [ is:pr review-requested:@me state:open archived:false         ] [ Apply ] [ Reset ]         |  gap space-2
+----------------------------------------------------------------------------------------------+
| Last fetched 2026-09-28 14:05   (spinner) Refreshing…                      [ Refresh ]       |  StatusBar, min-height 40px, fg-muted
|                                                                            ▔▔▔▔▔▔           |  auto refresh bar along the bottom edge of Refresh
| (!) Could not reach GitHub. Check your connection and press Refresh.                         |  error line, danger-fg
+----------------------------------------------------------------------------------------------+
| handlename/review-dashboard (2)                                                              |  GroupSection h2, space-5 above
| +------+----------------------------------+--------+-----------+----------+---------+-------+|
| | #    | Title                            | Author | Reviews   | Diff     | Created | Upd.v ||  thead, canvas-subtle; Organization and Repository hidden
| +------+----------------------------------+--------+-----------+----------+---------+-------+|
| | 123  | Fix pagination bug               |  (o)   | (o)A (o)C | +120 -30 | 2026-09-| 2026- ||  row, min-height 48px
| |      | [ext]                            | alice  |           | 4 files  | 27 10:02| 09-28 ||
| +------+----------------------------------+--------+-----------+----------+---------+-------+|
+----------------------------------------------------------------------------------------------+
```

- The drawing shows the in-progress indicator and the error line together only to place every element; which of them appear in each state is fixed in [States](#states)
- In the drawing, `(o)` is an avatar and the letter after it stands for the review state icon; `Upd.v` is the Updated column with the descending sort icon
- The header, QueryBar, and StatusBar span the content width; the PR table sits in a scroll wrapper below them
- When grouping is `none`, the table appears directly below the StatusBar without a group heading

## Components

Every component below is in `ui/` as listed in [ARCHITECTURE.md](ARCHITECTURE.md#directory-layout).

### App

Elements:

- Header: `<header>` containing `<h1 tabindex="-1">review-dashboard</h1>` and, on the Dashboard only, the grouping select and the Settings button, grouped at the right end with `--rd-space-3` between them
- Grouping select: visible `<label>` "Group by" and a `<select>` with options None, Organization, Repository (FR-LIST-5)
- Settings button: secondary button containing only the settings icon, with `aria-label="Settings"` and `aria-haspopup="dialog"`. It opens the [SettingsDialog](#settingsdialog)
- Two live regions that are always in the DOM, visually hidden: one with `role="status"` and one with `role="alert"`. Only their text changes (4.1.3)
- Screen switch: the PAT input screen when no PAT is saved or the state is Unauthorized; otherwise the Dashboard

Behavior:

- Changing the grouping select applies immediately and persists (FR-LIST-5)
- Focus after a screen change:

| Change | Focus moves to |
|---|---|
| Save a PAT | `<h1>` |
| Enter Unauthorized | PAT input |
| Log out | PAT input |

- Messages sent to the live regions are listed in [States](#states)
- `<html lang="en">` and `<title>review-dashboard</title>` are written statically in `index.html` (2.4.2, 3.1.1); App does not set them

Used tokens: `--rd-font-size-400`, `--rd-font-weight-semibold`, `--rd-layout-gutter`, `--rd-color-border-default` (header bottom rule).
States: [Screen column](#state-matrix).

### TokenForm

Elements (see [PAT input screen](#pat-input-screen)):

- `<h2>` "Enter a personal access token" and the storage note
- Error line with the warning icon, `id` referenced by the input's `aria-describedby`
- `<label for>` "Personal access token" and `<input type="password" autocomplete="off" spellcheck="false">`
- Save (primary). Log out (secondary), in the Unauthorized state only
- Permission notes for classic and fine-grained tokens

Behavior:

- Pressing Save or Enter with an empty or whitespace-only input shows "Enter a token." in the error line, sets `aria-invalid="true"` on the input, and keeps focus on the input (3.3.1)
- Pressing Save with a non-empty input saves the PAT and switches to the Dashboard; fetching starts there (FR-AUTH-1)
- In the Unauthorized state, the error line reads "Your token is invalid or expired." and the input has `aria-invalid="true"` (FR-AUTH-3)
- Log out removes the PAT and the cache (FR-AUTH-2) and shows this screen without the error line and without Log out

Used tokens: `--rd-font-size-500`, `--rd-color-fg-muted`, `--rd-color-danger-fg`, `--rd-color-border-control`, `--rd-control-height`.
States: [Unauthorized row](#state-matrix).

### QueryBar

Elements:

- Visible `<label for>` "Search query"
- `<input type="text">` in `--rd-font-family-mono`, growing to fill the row (`flex: 1 1 320px`)
- Apply (primary) and Reset (secondary)
- Helper line "A search query is required.", shown only while the input is empty, referenced by the input's `aria-describedby`

Behavior:

- Enter in the input runs Apply (FR-QUERY-2)
- While the input is empty or whitespace-only, Apply has `aria-disabled="true"` and pressing it does nothing (FR-QUERY-5). It is not `disabled`, so focus is never lost
- Reset puts the default query in the input and applies it (FR-QUERY-4)
- The input follows the search query in the page URL, so browser back and forward update it (FR-QUERY-3)
- Apply and Reset work in every state, including while fetching; applying aborts the running fetch ([ARCHITECTURE.md](ARCHITECTURE.md#authentication-and-errors))

Used tokens: `--rd-font-family-mono`, `--rd-color-border-control`, `--rd-color-canvas-default`, `--rd-space-2`, `--rd-space-4`.
States: [QueryBar column](#state-matrix).

### StatusBar

Elements, as listed in [ARCHITECTURE.md](ARCHITECTURE.md#directory-layout):

- Last fetched time: "Last fetched " followed by a `<time>` element (FR-CACHE-5)
- In-progress indicator: spinner icon and text (FR-CACHE-5)
- Error line: warning icon and message in `--rd-color-danger-fg` (FR-ERR-1)
- Refresh (secondary, with the refresh icon), aligned to the right end (FR-CACHE-4)
- Auto refresh bar: a 2px bar along the bottom edge of Refresh, in `--rd-color-accent-emphasis` (`CanvasText` in forced colors mode), shown only while an automatic refresh is scheduled (FR-CACHE-9). It is decorative (`aria-hidden="true"`); Refresh is described by visually hidden text "Auto refresh every <n> minute(s)" through `aria-describedby`

Behavior:

- While fetching, Refresh has `aria-disabled="true"` and pressing it does nothing
- The auto refresh bar grows from the left edge to the right edge over the auto refresh interval, starting when the last fetch finished or when the interval was changed. It is not shown when auto refresh is Off, while fetching, or after a rate limit error or an invalid PAT, because no automatic refresh is scheduled then (FR-CACHE-8)
- Each automatic refresh writes "Refreshing pull requests" and then "Updated. <n> pull requests" to the status live region, the same as a manual refresh

Used tokens: `--rd-font-size-200`, `--rd-color-fg-muted`, `--rd-color-danger-fg`, `--rd-color-accent-emphasis`, `--rd-space-2`, `--rd-space-3`.
States: [StatusBar column](#state-matrix).

### PullRequestTable

Sorting follows FR-LIST-6 and FR-LIST-7: clicking a sortable header sorts by that column, and clicking it again reverses the direction.
The initial sort is Updated, descending.

| Column | Content | Align | Width | Sortable | Requirements |
|---|---|---|---|---|---|
| Number | `#123`, `--rd-font-size-100` | Right | 56px | Yes | FR-LIST-1, FR-LIST-8 |
| Title | PR title link, then the external link icon, then the stack badge | Left | Remaining, at least 160px | Yes | FR-LIST-1, FR-LIST-4, FR-LIST-8, FR-LIST-14 |
| Organization | Organization login | Left | 96px | Yes | FR-LIST-1, FR-LIST-8 |
| Repository | Repository name without the owner | Left | 112px | Yes | FR-LIST-1, FR-LIST-8 |
| Author | See [Author cell](#author-cell) | Left | 88px | Yes (by login) | FR-LIST-1, FR-LIST-8 |
| Reviews | See [ReviewBadges](#reviewbadges) | Left | 152px | No | FR-LIST-3 |
| Diff | `+adds` and `-dels` on line 1, `n files` on line 2, `--rd-font-size-100` | Right | 120px | Yes (adds + dels) | FR-LIST-1, FR-LIST-2, FR-LIST-8 |
| Created | Date and time, or relative time; `--rd-font-size-100` | Right | 120px | Yes | FR-LIST-1, FR-LIST-8, FR-LIST-13 |
| Updated | Date and time, or relative time; `--rd-font-size-100` | Right | 120px | Yes | FR-LIST-1, FR-LIST-8, FR-LIST-13 |

The table header text for the Number column is `#`.

Elements:

- `<table>` with `table-layout: fixed`, `min-width: var(--rd-table-min-width)`, in a wrapper with `overflow-x: auto` and a `--rd-color-border-default` border with `--rd-radius-medium`
- `<thead>` cells are `<th scope="col">` on `--rd-color-canvas-subtle`, semibold `--rd-font-size-100`
- A sortable header contains a `<button>` that fills the cell and has the column name as its text. The active column shows the sort icon after the name, with `aria-hidden="true"`
- `aria-sort` is set only on the `<th>` of the active sort column (`ascending` or `descending`). Initially the Updated `<th>` has `aria-sort="descending"`
- The Reviews header is plain text, not a button
- Body rows have `min-height: 48px`, padding `--rd-space-2`, a bottom rule in `--rd-color-border-default`, and `--rd-color-row-hover` as background on hover. Hover styles in the table apply only inside `@media (hover: hover)`, so they do not stick after a tap on touch screens
- The title is `<a href target="_blank" rel="noopener noreferrer">` in `--rd-color-accent-fg`, underlined on hover and focus, followed by the external link icon and visually hidden text "(opens in a new tab)"
- The link is rendered only when the URL starts with `https://github.com/` ([ARCHITECTURE.md](ARCHITECTURE.md#security)); otherwise the title is plain text
- Stack badge (FR-LIST-14): for a PR in a stacked PR, the title (link or plain text) is followed by a badge outside the link with the stack icon and `n/m`, in `--rd-color-fg-muted` and `--rd-font-size-100`, with a `--rd-border-width-thin` `--rd-color-border-default` border and `--rd-radius-medium`. The icon and `n/m` are `aria-hidden="true"` and carry `title` "Stack #20: 2 of 3"; the same text follows as visually hidden text "(Stack #20: 2 of 3)"
- Diff: `+120` in `--rd-color-success-fg`, `-30` in `--rd-color-danger-fg`, and `4 files` in `--rd-color-fg-muted`. The sort key is additions + deletions ([GLOSSARY.md](GLOSSARY.md#diff-stat-diffstat)); the file count does not affect order
- Columns that repeat the group heading are hidden (FR-LIST-11): Organization when grouping by organization; Organization and Repository when grouping by repository. The Title column takes the freed width
- Draft rows (FR-LIST-12): the row has the `pr-draft` class and a `--rd-color-canvas-inset` background (`--rd-color-row-hover` on hover, as for other rows), and its text, title link, and diff numbers are all in `--rd-color-fg-muted`. The title link is always underlined, because its color no longer sets it apart. The title is followed by visually hidden text "(draft)", so the difference is not conveyed by color alone (1.4.1). Avatars and review badges keep their colors
- Created and Updated are `<time datetime>` elements with the ISO 8601 time. With relative times on (FR-LIST-13), they show the time relative to now in English, such as "5 minutes ago", "yesterday", or "last month", and the absolute date and time in `title`. Times less than a minute old, including times slightly in the future, show "now". The relative times are recomputed every minute. Sorting uses the timestamps, not the displayed text

Target size: every button in this table and in the header, QueryBar, StatusBar, and PAT input screen is at least 24px by 24px (2.5.8); `--rd-control-height` makes buttons 32px tall, and header sort buttons fill a cell at least 32px tall.

#### Author cell

- A 20px round avatar (`<img alt="" referrerpolicy="no-referrer" width="20" height="20">`) with the login below it in `--rd-font-size-100` `--rd-color-fg-muted`
- Before the image loads, a 20px circle in `--rd-color-canvas-inset` is shown in its place
- The ghost icon replaces the image when the author is null, the avatar URL is null, or the image fails to load (`onError`)
- When the author is null, the login text is `ghost`

Used tokens: `--rd-color-canvas-subtle`, `--rd-color-row-hover`, `--rd-color-border-default`, `--rd-color-accent-fg`, `--rd-color-success-fg`, `--rd-color-danger-fg`, `--rd-color-fg-muted`, `--rd-table-min-width`, `--rd-control-height`.
States: [PR list column](#state-matrix).

### GroupSection

Elements:

- `<section>` with `--rd-space-5` above it
- `<h2>` with the group name in `--rd-font-size-300` semibold, followed by the PR count as `(n)` in `--rd-color-fg-muted` (FR-LIST-9)
- Its own PullRequestTable with its own `<thead>`

Behavior:

- Groups are ordered by group name ascending (FR-LIST-9). The group name is the organization login for `owner` and `owner/name` for `repository`
- All groups share one sort state; every table shows the same `aria-sort` and sort icon, and clicking a header in any group re-sorts every group
- When grouping is `none`, no GroupSection is rendered and a single PullRequestTable is shown

Used tokens: `--rd-font-size-300`, `--rd-font-weight-semibold`, `--rd-color-fg-muted`, `--rd-space-5`.
States: [PR list column](#state-matrix).

### SettingsDialog

Elements:

- A native `<dialog>` opened as a modal with `showModal()`, labelled by its `<h2>` "Settings" through `aria-labelledby`
- "Show relative times" checkbox with a `<label for>` (FR-LIST-13)
- "Auto refresh" visible `<label>` and a `<select>` with options Off, 1 minute, 5 minutes, 10 minutes, 30 minutes (FR-CACHE-7)
- Below a `--rd-color-border-default` rule: the line "Logging out removes the saved token and cached results from this browser." in `--rd-color-fg-muted`, then Log out (danger) at the left end and Close (primary) at the right end (FR-AUTH-2). Log out points at the line with `aria-describedby`
- `::backdrop` in `--rd-color-backdrop`

Behavior:

- Changes take effect and are saved immediately; there is no Save button (FR-SET-1)
- Esc and Close close the dialog. The browser keeps focus inside the dialog while it is open and returns focus to the Settings button when it closes
- Log out closes the dialog, removes the PAT and the cache (FR-AUTH-2), and shows the PAT input screen
- The settings are kept across reloads and logouts ([ARCHITECTURE.md](ARCHITECTURE.md#persistence))

Used tokens: `--rd-color-canvas-default`, `--rd-color-fg-default`, `--rd-color-fg-muted`, `--rd-color-danger-fg`, `--rd-color-border-default`, `--rd-color-backdrop`, `--rd-radius-medium`, `--rd-font-size-300`, `--rd-space-2` to `--rd-space-5`.

### ReviewBadges

Shows the latest review per reviewer (FR-LIST-3).

Elements:

- `<ul>` with no bullets, laid out in rows with `--rd-space-1` gap that wrap within the cell; each item is `<li>`
- Each review badge is `<span role="img" aria-label="carol: Approved" title="carol: Approved">` containing:
  - A 20px round avatar `<img alt="" referrerpolicy="no-referrer">`, with the same placeholder and ghost rules as the [Author cell](#author-cell)
  - The 12px review state icon, overlapping the bottom-right corner of the avatar by 4px, with a 2px ring in `--rd-color-canvas-default`
- The text in `aria-label` and `title` is `<login>: <Label>` using the Label column of [Review states](#review-states). A null reviewer uses `ghost` as the login
- Badges are ordered by submitted time ascending
- Badge centers are 24px apart, horizontally and between wrapped rows
- Every review is shown as a badge. Badges that do not fit in the column width wrap to the next row, and the row grows taller
- With no reviews, the cell contains `<span aria-hidden="true">—</span><span class="visually-hidden">No reviews</span>`

Behavior:

- Badges are not focusable and not clickable, so they are not pointer targets and 2.5.8 does not apply to them
- The tooltip is the browser's `title` tooltip

Used tokens: review state colors from [Review states](#review-states), `--rd-color-canvas-default`, `--rd-color-canvas-inset`, `--rd-radius-full`.
States: [PR list column](#state-matrix).

## States

### State matrix

Rows are the states of `usePullRequests` in [ARCHITECTURE.md](ARCHITECTURE.md#state-transitions).
"Status" and "Alert" are the texts written to the live regions held by [App](#app).

| State | Screen | QueryBar | StatusBar | PR list |
|---|---|---|---|---|
| Idle | Dashboard | Enabled | Unchanged from the previous render | Nothing rendered. Idle moves to the next state synchronously, so it is never painted |
| ShowingCache | Dashboard | Enabled | "Last fetched <fetchedAt>" | Cached list |
| Refreshing | Dashboard | Enabled; Apply aborts the refresh | "Last fetched <fetchedAt>", spinner, "Refreshing…"; Refresh is `aria-disabled`. Status: "Refreshing pull requests" | Cached list is kept (FR-CACHE-3) |
| Ready | Dashboard | Enabled | "Last fetched <fetchedAt>". Status: "Updated. <n> pull requests" | Fetched list |
| ErrorWithCache | Dashboard | Enabled | "Last fetched <fetchedAt>" and the error line. Alert: the error message | Cached list is kept (FR-ERR-2) |
| Fetching | Dashboard | Enabled; Apply aborts the fetch | "Not fetched yet", spinner, "Loading…"; Refresh is `aria-disabled`. Status: "Loading pull requests" | "Loading pull requests…" in `--rd-color-fg-muted` |
| Error | Dashboard | Enabled | "Not fetched yet" and the error line. Alert: the error message | "Could not load pull requests." in `--rd-color-fg-muted` |
| Unauthorized | PAT input screen with the error line and Log out | Not rendered | Not rendered. Alert: "Your token is invalid or expired." | Not rendered |

Error messages (FR-ERR-1):

| Cause | Message |
|---|---|
| Network | "Could not reach GitHub. Check your connection and press Refresh." |
| RateLimit | "GitHub rate limit reached. Try again later." |
| Other | "Check the search query and press Refresh. GitHub returned an error: <message from the response>" |

HTTP 401 is not in this table; it leads to Unauthorized.

### Conditions

These apply on top of any state whose PR list column shows a list.

| Condition | Applies to | Display |
|---|---|---|
| Empty | ShowingCache, Refreshing, Ready, ErrorWithCache | "No pull requests match this query." in `--rd-color-fg-muted` instead of the table (FR-LIST-10) |
| Truncated | Ready only | A line above the table in `--rd-color-fg-muted`: "Showing <shown> of <issueCount> results (search limit: 1,000)" (NFR-6) |

- Truncated appears when the fetch that just completed stopped at the 1,000-result limit. `issueCount` comes from that fetch response; it is not stored in the cache, so the line is not shown for a cached list
- `<shown>` is the number of PRs in the list, which can be lower than 1,000 because issue results are dropped ([ARCHITECTURE.md](ARCHITECTURE.md#fetch-query))
- When a saved PAT belongs to a different account, the previous account's cached list stays visible until the refresh completes, because the cache is tied only to the search query

## Interaction and accessibility

Tab order follows the visual order: header (grouping select, Settings) → QueryBar (input, Apply, Reset) → StatusBar (Refresh) → for each group, table header sort buttons → PR title links row by row.
In the settings dialog: Show relative times → Auto refresh → Log out → Close.
On the PAT input screen: PAT input → Save → Log out.

Focus ring: every focusable element shows `outline: var(--rd-border-width-focus) solid var(--rd-color-focus); outline-offset: 2px;` on `:focus-visible`.
The ring is drawn with `outline`, never `box-shadow`, so it stays visible in forced colors mode.

| Criterion | Where | How |
|---|---|---|
| 1.1.1 Non-text Content | Avatars, review badges, icons | Avatars have `alt=""`; badges carry names through `role="img"` and `aria-label`; decorative icons are `aria-hidden="true"`; the stack badge hides its icon and `n/m` and carries hidden "(Stack #20: 2 of 3)" text instead |
| 1.3.1 Info and Relationships | Tables, headings, forms, badge list | `<th scope="col">`, `<h1>`/`<h2>`, `<label for>`, `<ul>`/`<li>` |
| 1.4.1 Use of Color | Review states, diff stat, errors, draft rows | Review states differ by shape; diff numbers carry `+`/`-` signs; errors have text and an icon; draft titles carry hidden "(draft)" text and an underline |
| 1.4.3 Contrast (Minimum) | All text | [Contrast](#contrast) table, threshold 4.5 |
| 1.4.4 Resize Text | Whole page | `min-height` instead of `height`; font sizes in px scale with browser zoom |
| 1.4.10 Reflow | Everything but the PR table | [Layout](#layout): wrap down to 320px; the table scrolls as a data table exception |
| 1.4.11 Non-text Contrast | Icons, focus ring, control boundaries | [Contrast](#contrast) table, threshold 3 |
| 1.4.12 Text Spacing | Whole page | No fixed heights; text containers may grow |
| 1.4.13 Content on Hover or Focus | Review badges | N/A (only UA-rendered `title` tooltips) |
| 2.1.1 Keyboard | All controls | Native `<button>`, `<a>`, `<input>`, `<select>`; Enter submits forms |
| 2.4.2 Page Titled | `index.html` | `<title>review-dashboard</title>` |
| 2.4.3 Focus Order | Whole page | Tab order above; focus moves on screen changes as listed in [App](#app) |
| 2.4.6 Headings and Labels | Headings, form labels | Descriptive `<h1>`/`<h2>` and visible labels |
| 2.4.7 Focus Visible | All focusable elements | Focus ring above |
| 2.4.11 Focus Not Obscured (Minimum) | Whole page | N/A (no sticky elements) |
| 2.5.8 Target Size (Minimum) | Buttons, select, links | Buttons and selects at least 32px tall; PR title links sit in 48px rows with no adjacent targets |
| 3.1.1 Language of Page | `index.html` | `<html lang="en">` |
| 3.3.1 Error Identification | TokenForm, QueryBar | `aria-invalid="true"` and a text message linked by `aria-describedby` |
| 3.3.2 Labels or Instructions | TokenForm, QueryBar, grouping select | Visible labels and helper text |
| 4.1.2 Name, Role, Value | Sort headers, badges, buttons | `aria-sort` on the active `<th>`; `role="img"` with `aria-label`; `aria-disabled` |
| 4.1.3 Status Messages | Live regions in App | `role="status"` for progress and completion, `role="alert"` for errors |

## Formatting

Dates and times:

- Shown as `YYYY-MM-DD HH:mm` in 24-hour time in the browser's local time zone, for example `2026-09-28 14:05`
- Built from `Date` local-time getters with zero padding; `toLocaleString` is not used, because its output varies by locale
- Wrapped in `<time datetime="2026-09-28T05:05:00Z">` with the original ISO 8601 value
- Created and Updated cells break the line between the date and the time when the column is too narrow
- StatusBar shows `Last fetched 2026-09-28 14:05`

Numbers:

- Formatted with `Intl.NumberFormat("en-US")`, for example `12,345`
- Diff stat: `+12,345` and `-1,234`; the file count is `1 file` for one file and `n files` otherwise
- PR count in the status live region: `1 pull request` for one PR and `n pull requests` otherwise, for example `Updated. 1,000 pull requests`
- PR number: `#` followed by the number without separators, for example `#12345`, matching GitHub

## Constraints checklist

| Constraint | Source | Rule in this design |
|---|---|---|
| `style-src 'self'` | CSP in [ARCHITECTURE.md](ARCHITECTURE.md#security) | All styles live in bundled stylesheets. No `style="..."` attribute in markup or SVG, no `<style>` element in SVG, no runtime-inserted `<style>` |
| React `style` prop | Design rule | Not used. It writes through CSSOM, which the CSP does not block, but states are expressed by toggling class names instead |
| `img-src 'self' https://avatars.githubusercontent.com` | CSP | Images come only from `avatarUrl` values checked in infra. No `url(data:...)` or other `data:` images in CSS; icons are inline SVG elements. No `github.com/<login>.png` URLs |
| `default-src 'self'` | CSP | No external CSS, no web fonts, no CDN, no `<link>` to other origins, no CSS `@import` from other origins |
| Runtime dependency is React only | [ARCHITECTURE.md](ARCHITECTURE.md#technology-stack) | No icon library, no Primer package, no date or tooltip library |
| No emoji | Design rule | Icons are SVG; text uses plain characters |
| NFR-3 connections | [REQUIREMENTS.md](REQUIREMENTS.md#non-functional-requirements) | API requests go only to `https://api.github.com`. Avatar images are loaded from `avatars.githubusercontent.com`, which the CSP already allows; `referrerpolicy="no-referrer"` avoids sending the page URL |
| Vite dev server | Build | The dev server injects `<style>` elements, which conflicts with the `<meta>` CSP. Decide how to handle this when implementing (see [Follow-ups](#follow-ups)) |

## Follow-ups

- Add a keyboard-reachable tooltip for reviewer names if keyboard users ask for it after implementation; currently names are available only through `title` and `aria-label`
- Check with screen readers whether `aria-label` plus an identical `title` is read twice; if so, drop `title` from badges and keep `aria-label`
- Confirm with real data which hosts GraphQL `avatarUrl` returns; URLs on other hosts are dropped and shown as ghosts
- Decide how the Vite dev server coexists with the `<meta>` CSP
- Check how review state icons look in forced colors mode (`forced-colors: active`)

## Appendix: Contrast check script

Run from the repository root:

```sh
awk '/^## Appendix: Contrast check script$/{s=1;next} s&&/^```js$/{c=1;next} c&&/^```$/{exit} c' UI_DESIGN.md > "${TMPDIR:-/tmp}/contrast.mjs" && node "${TMPDIR:-/tmp}/contrast.mjs" < UI_DESIGN.md
```

It prints one `OK` or `NG` line per theme and pair in [Contrast](#contrast), and exits with 1 if any line is `NG`.

```js
import { readFileSync } from "node:fs";
const md = readFileSync(0, "utf8");
const cells = l => l.split("|").slice(1, -1).map(c => c.trim().replace(/`/g, ""));
const section = h => { const m = md.split(/^(?=## |### )/m).find(s => s.startsWith(h + "\n")); if (!m) throw new Error(`missing ${h}`); return m.split("\n").map(cells).filter(c => c[0]?.startsWith("--rd-")); };
const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = h => { const [r, g, b] = h.slice(1).match(/../g).map(x => lin(parseInt(x, 16))); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const tok = new Map(section("### Color tokens").map(([n, l, d]) => [n, { light: l, dark: d }]));
let bad = 0;
for (const [fg, bg, lr, dr, th] of section("### Contrast")) {
  if (th === "decorative") continue;
  for (const [t, rec] of [["light", lr], ["dark", dr]]) {
    const a = tok.get(fg)?.[t], b = tok.get(bg)?.[t];
    if (!/^#[0-9a-f]{6}$/.test(a ?? "") || !/^#[0-9a-f]{6}$/.test(b ?? "")) { console.log(`NG unknown token ${fg}/${bg}`); bad++; continue; }
    const r = ratio(a, b), shown = (Math.floor(r * 100) / 100).toFixed(2);
    const ok = r >= Number(th) && shown === rec;
    console.log(`${ok ? "OK" : "NG"} ${t} ${fg} on ${bg}: ${r.toFixed(3)} (recorded ${rec}, threshold ${th})`);
    if (!ok) bad++;
  }
}
process.exit(bad ? 1 : 0);
```
