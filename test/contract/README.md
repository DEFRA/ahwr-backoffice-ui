# Contract tests (Pact)

Consumer-driven contract tests between `ahwr-backoffice-ui` (consumer)
and `ahwr-application-backend` (provider), using [Pact](https://docs.pact.io/).

## Why this exists

E2E tests that exercise both services together (real backend, real database - see
`ahwr-ui-tests`) only run after `ahwr-backoffice-ui` merges and
`ahwr-application-backend` merges to main. So a breaking interface change
between the two services can merge, and even deploy, before anything actually catches it - by
the time E2E or a shared environment surfaces the problem, the bad change is already out.

## Running

```
npx jest --selectProjects contract          # all contract tests
npx jest test/contract/api/claims-search    # just this endpoint
```

Runs as its own Jest project (`jest.config.cjs`), separate from `unit` and `integration` -
these tests do real HTTP I/O against a local Pact mock server, so they don't fit either of
those tiers cleanly.

## Structure

```
test/contract/
  data/                        fixtures shared across endpoints - real values, not made up
  api/
    <endpoint>/
      <endpoint>.pact.test.js  jest.mock setup + test cases
      provider/                the endpoint's contract: mock server + request shape
      consumer/                the consumer-side code that calls it
```

Grouped by endpoint (`claims-search/` today), not by role - keeps everything about one
endpoint's contract together, and a new endpoint is just a new sibling folder with its own
`provider/`/`consumer/` pair.

## Design decisions worth knowing before extending this

**Fixtures are narrow, not a full mirror of the response.** Only fields the consumer actually
reads (checked against `app/routes/models/claim-list.js`) are asserted. A full-shape contract
would fail verification every time the backend changes a field the frontend doesn't use -
false-positive breakage that erodes trust in the whole suite. Add a field to a fixture only
when a real consumer dependency on it exists, not pre-emptively.

**Matchers should reflect what the consumer's code actually requires, not the full possible
value space.** e.g. `type` and `status` use `string()` (type-only match), not `equal()` or an
enumerated `regex()` - the consumer code (`formatTypeOfVisit`, `getStyleClassByStatus`) both
tolerate any string gracefully, so asserting an exact/enumerated value would be stricter than
what's actually depended on, and would break for legitimate values outside that set.

**The `jest.mock()` port must be a literal, not imported.** `applicationApiUri` is read out of
`config` once at import time in `app/api/claims.js`, so the mock has to redirect it to the
local Pact mock server before that import resolves. Babel hoists `jest.mock()` above all
imports in the file it's written in - which means the factory can't reference a value imported
from another file (it'll either be rejected outright, or be `undefined` at the point the
factory runs, depending on the specific circular-require path). Keep the port as a literal in
the `.pact.test.js` file, matching `MOCK_PACT_PORT` in the corresponding `provider/` file by
convention, not by import.

**`pacts/` is generated, then committed.** Regenerated on every passing test run
(`PactV3.executeTest`'s `cleanup()` writes it), same as `package-lock.json` - a build output
that's still tracked in git so it can be reviewed like any other change and fetched by the
backend without a separate publish step. `docker-compose.test.yaml` mounts
`./pacts:/home/node/pacts` (same pattern as the existing `test-output` mount) so the file
generated inside the test container lands on the host filesystem where it can be committed.

**Nothing auto-commits the regenerated file - a verify check catches drift instead.**
`.husky/pre-push`, `.github/workflows/check-pull-request.yml`, and `.github/workflows/publish.yml`
all run the same check right after the test suite: `git status --porcelain pacts/` - if the
freshly-regenerated file doesn't match what's committed, it fails loudly and tells you to
regenerate and commit again. This is deliberate: a bot silently patching the contract back onto
the branch would hide the exact thing this pilot exists to make visible - what the contract
actually changed to, in a normal reviewable diff.

**No Pact Broker for the pilot.** The backend fetches the committed file directly via `curl`
against `raw.githubusercontent.com` on `main`, authenticated with the same PAT it already used
for the previous GitHub Release approach. Fine for a single consumer-provider pair with no
deployment-gating needs; a real Pact Broker would be the answer if version-aware resolution
(which consumer version is compatible with which provider version) is ever actually needed.

## What's built and verified

Provider verification exists in `ahwr-application-backend` (`tests/contract/provider.pact.test.js`,
`npm run test:contract`) and passes against this contract - confirmed by actually running it
against a real server and real MongoDB, not just asserted. Its seed data
(`tests/contract/data/`) must be kept in sync with this repo's `test/contract/data/claims-response.js`,
including `createdAt` values - the backend sorts by `createdAt DESC` by default, so the seed
data's timestamps have to produce the same ordering this contract's response array assumes, or
verification fails on array-position mismatches that have nothing to do with the actual data
being wrong.

## What's not built yet

- Any endpoint beyond `POST /claims/search`, and only its no-filters scenario at that -
  add more `provider/`+`consumer/` exports and test cases as real need arises, not ahead of it
