# Contract tests (Pact)

Consumer-driven contract tests between `ahwr-backoffice-ui` (consumer)
and `ahwr-application-backend` (provider), using [Pact](https://docs.pact.io/).

## Why this exists

E2E tests that exercise both services together (real backend, real database - see
`ahwr-ui-tests`) only run after `ahwr-backoffice-ui` merges to `main` -
`ahwr-application-backend` has no E2E trigger of its own at all. So a breaking interface change
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

**`pacts/` is generated, not committed.** Regenerated on every passing test run
(`PactV3.executeTest`'s `cleanup()` writes it). `docker-compose.test.yaml` mounts
`./pacts:/home/node/pacts` (same pattern as the existing `test-output` mount) so the file
generated inside the test container actually lands on the runner's filesystem, not just
inside the ephemeral container - without this mount, CI would have nothing to publish.

**CI publish is wired up, no Pact Broker for the pilot.** `.github/workflows/publish.yml`
has a "Publish Pact contract" step, right after `./scripts/test`, that publishes `pacts/*.json`
as the asset on a single rolling GitHub Release tagged `pact-contracts` - deleting and
recreating it on every successful push to `main`, so there's always exactly one "latest"
contract to fetch, not a version to track. Uses the existing `GITHUB_TOKEN`, no new secret.

## What's built and verified

Provider verification exists in `ahwr-application-backend` (`tests/contract/provider.pact.test.js`,
`npm run test:contract`) and passes against this contract - confirmed by actually running it
against a real server and real MongoDB, not just asserted. Its seed data
(`tests/contract/data/`) must be kept in sync with this repo's `test/contract/data/claims.js`,
including `createdAt` values - the backend sorts by `createdAt DESC` by default, so the seed
data's timestamps have to produce the same ordering this contract's response array assumes, or
verification fails on array-position mismatches that have nothing to do with the actual data
being wrong.

## What's not built yet

- The backend-side fetch-and-verify CI step, pulling the `pact-contracts` release asset from
  this repo automatically before running provider verification (AC04) - today the pact file has
  to be copied into `ahwr-application-backend/pacts/` manually
- Any endpoint beyond `POST /claims/search`, and only its no-filters scenario at that -
  add more `provider/`+`consumer/` exports and test cases as real need arises, not ahead of it
