# Dependency Weather

Surface missing dependency evidence alongside explicit maintenance signals.

**Status:** implemented browser-local research prototype. Automated tests can be reproduced with the command below. The existing Pages site previously passed smoke checks. The observation-age update is locally tested; its latest deployment and browser behavior have not been verified.

## Website

Live website: https://royalpuskar.github.io/dependency-weather/

## Problem and approach

Dependency reviewers need to distinguish missing observations from outdated ones. A supplied zero-vulnerability count is not necessarily recent evidence. This tool reports observation age independently from release age and the supplied maintenance signals. It runs the same pure JavaScript engine in the browser and Node tests. All input is provided by the user or the included synthetic fixture; no external facts are inferred.

## Implemented features

- Editable scenario with a synthetic example and reset control.
- Deterministic analysis, summary metrics, filterable result table, and JSON report export.
- Input validation, explicit errors, and invalidation of outdated reports after edits.
- Keyboard-accessible controls, responsive layout, and large-screen CSS.
- Zero runtime dependencies and no external API calls.

## Install and run

Requirements: Python 3 for a static local server, Node.js 22 or later for tests.

```sh
git clone https://github.com/Royalpuskar/dependency-weather.git
cd dependency-weather
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html through a file URL; ES modules require a server.

```sh
node --test test.mjs
```

## Example and schema

The complete example in `sample.mjs` defines the supported input shape:

```json
{
  "packages": [
    {
      "name": "example-a",
      "ageDays": 400,
      "license": "MIT",
      "vulnerabilities": 0
    },
    {
      "name": "example-b",
      "ageDays": null,
      "license": null,
      "vulnerabilities": null
    }
  ]
}
```

Edit one value and select **Run analysis**. **Reset example** restores the fixture. **Export report** downloads the current result; it never publishes it.

Input is capped at 200,000 serialized characters, arrays processed by the engine at 500 elements, and numeric magnitudes at 1e12. Domain constraints are checked inside `engine.mjs`; unsupported structures return an error.

## Observation freshness

Optional package field `observedOn` records the calendar date on which the supplied package observations were collected. When present, root `asOf` is required. Both use exact valid YYYY-MM-DD dates, compared at UTC midnight. No system clock is consulted, so a saved scenario is reproducible.

Optional root `maxEvidenceAgeDays` is a nonnegative integer, default 30. Configuring it also requires `asOf`. An observation exactly that many days old is within the window; older evidence is stale. Future observations relative to `asOf` are rejected. Missing/null observation dates are undated, even when other fields are populated.

```json
{"asOf":"2026-11-24","maxEvidenceAgeDays":0,"packages":[
{"name":"example","ageDays":10,"license":"MIT","vulnerabilities":0,"observedOn":"2026-11-23"}
]}
```

Expected result: evidence age 1 day, status stale, and the supplied vulnerability count still 0. This warns about evidence age without inventing vulnerabilities.

Rows include `observedOn`, `evidenceAgeDays`, and `evidenceStatus` (undated, stale, or within-window). Metrics count stale and undated packages. The report records its reference date and evidence-window policy. Undated observations now contribute a signal, so fully populated legacy inputs without dates no longer produce “no configured signals.”

The observation date applies to all supplied fields for that package. If fields were collected on different dates, this simplified model cannot represent that distinction. Release age remains the supplied value and is not automatically advanced. Within-window is not a claim of safety, authenticity, completeness, or live registry verification. The 30-day default is an illustrative review setting, not an industry standard.

Package names are unique exact labels; combine records or use distinct version-qualified labels when necessary. Vulnerability counts must be nonnegative integers. License values must be text or absent; license labels are not validated as SPDX expressions.

## Architecture and request flow

`index.html` loads `app.mjs`, which parses scenario JSON and calls `run` from `engine.mjs`. The engine returns `metrics` and `rows`; the UI renders values with `textContent`, never user-supplied HTML. Editing invalidates the prior report. Export creates a local Blob download.

There is no application authentication, credential store, session cookie, or token lifecycle. GitHub Pages serves public static files. The app does not collect passwords or API keys, contact third-party APIs, persist inputs, or send scenario data over the network. GitHub hosting can still receive ordinary page request metadata. Reloading discards edits.

## Limitations

Uses supplied observations only; performs no registry queries and cannot determine package safety.

The interface shares a portfolio design system, while this repository has its own domain engine, fixture, and tests. No accuracy, novelty, production-readiness, or 4K visual-test claim is made. Large-screen CSS is not a substitute for device testing.

## Validation

Nine local Node tests pass for this update. They cover window boundaries, stale zero-vulnerability observations, undated evidence, leap-day arithmetic, invalid/future dates, required reference dates, field validation, duplicate identities, deterministic results, and original fixture behavior. These are synthetic fixture results, not measurements of real dependency safety. Mobile, laptop, and 3840×2160 browser checks have not been performed for this update.

`test.mjs` checks domain outcomes and edge cases, deterministic behavior, input preservation, malformed roots, and size limits. GitHub Actions runs the same suite. Review the tests themselves to see exactly what is covered; passing these checks does not establish security or exhaustive correctness.

## Roadmap

- Add more independently reviewed domain fixtures and explicit schema documentation.
- Add domain-specific form controls alongside the JSON editor.
- Expand accessibility and mobile browser testing.
- Revisit the documented domain limitations before production use.

## Contribution and license

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).

© 2026 Puskar (Royalpuskar). All rights reserved except permissions granted by the MIT license. Preserve applicable third-party notices.

