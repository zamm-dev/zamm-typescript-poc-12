---
id: QBK339
type: ref-impl
specs:
  - id: RQY572
    path: /spec-history/feature-git-workflow.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 6952465949cc181d26a57a93a63296b4bd3ec854
    message: Prevent end-to-end test from running in hooks/CI
  - sha: 8e640a2918c6654b7fca078db23da8c4ea22adc1
    message: Fix test isolation and handle cleanup
  - sha: 1b58cd0532f74fb09d65204ac55a45d9f069a51c
    message: Implement end-to-end test for feat start command
  - sha: 2553a31a81a6bb72ae1adb88b22f6f6c3699aae3
    message: Initial implementation of externalized Git workflow
---

# Feat Start Worktree Script Wrapper

## Overview

Connected the `feat start` command to the new `dev/start-worktree.sh` workflow script. The CLI now shells out to that script, respects `ZAMM_INIT_DIR_OVERRIDE`, and limits its own responsibility to initializing `.zamm/current-workflow-state.json` in the correct directory.

## How the CLI Wrapper Works

- `src/core/commands/feat.ts` now resolves the script path via `ZAMM_FEAT_START_SCRIPT` (falls back to `dev/start-worktree.sh`).
- Uses `spawn` so stdout/err stream through to the user while still allowing us to capture markers.
- Watches script stdout for a `ZAMM_INIT_DIR_OVERRIDE=<path>` line; if present we re-root `.zamm/` initialization to that directory.
- Replaced the old `BaseWorkflowService`/`WorktreeWorkflowService` duo with a single `WorkflowStateService` that always initializes/updates `.zamm/current-workflow-state.json` with `{ "state": "INITIAL" }`.
- Errors now surface if the script is missing or exits non-zero, rather than retrying branch creation inside the CLI.

## `dev/start-worktree.sh`

- Lives at the project root and is committed so users can edit it for their workflow.
- Validates it is run from the git root on `main`/`master`; exits with clear errors otherwise.
- Delegates branch/title generation to `aichat`, creates the worktree (`git worktree add ../<slug> -b zamm/<slug>`), and uses `zamm spec changelog` to seed the spec-history file.
- Emits `ZAMM_INIT_DIR_OVERRIDE=<worktree-path>` so the CLI initializes `.zamm/` inside the worktree instead of the base repo.
- Prints next-step guidance (`cd '<worktree>' && claude "/change-spec"`).

## Testing Notes

- Regular unit tests stub the workflow script via `ZAMM_FEAT_START_SCRIPT` and rely on fixtures in `src/__tests__/fixtures/feat/scripts/`.
- Integration coverage that runs the real script (and thus `aichat`) is gated behind `RUN_E2E_TESTS=true npm test`. Without that env var the heavy test is skipped, which keeps CI from requiring external binaries.
- Tests expect `dist/zamm` to exist on `PATH`; run `npm run build` beforehand if you touch the script or CLI wrapper.

## Gotchas & Guidance

- Because the CLI simply reruns `WorkflowStateService.initialize`, any previous `.zamm/current-workflow-state.json` is reset to `INITIAL`; downstream steps must bump the state again.
- `ANTHROPIC_API_KEY` is no longer used by `feat start`, but the binary still loads the Anthropics client when other commands run—set a dummy key if you need to call `zamm` without real credentials.
- When overriding the script path in tests or local experiments, ensure the override is executable and uses absolute paths when emitting `ZAMM_INIT_DIR_OVERRIDE`; the CLI resolves relative overrides against the git root.
- The script assumes `aichat`, `zamm`, and `git` are already available on `PATH`. Document or export those when onboarding new environments.
