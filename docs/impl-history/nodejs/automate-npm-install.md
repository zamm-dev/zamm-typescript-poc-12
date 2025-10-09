---
id: XKP185
type: ref-impl
specs:
  - id: CJC594
    path: /spec-history/start-worktree-fix.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: c01f8fcdb8ae7403dc9521bb43d0bd33b91e8913
    message: Add guidance to verify external CLI commands in specs
  - sha: edb5c5e877944076651835ec43114142f7795ebb
    message: Automate npm install in start-worktree.sh
---

# Automate npm install in start-worktree.sh

## Implementation Summary

Updated `dev/start-worktree.sh` to automatically run `npm install` after creating a new worktree, eliminating the need for manual setup steps documented in slash commands.

## Key Implementation Details

- Added `npm install` step in the script after spec file creation
- Removed manual setup instruction (step 5) from `.claude/commands/change-spec.md`
- Updated `docs/specs/dev-scripts.md` to reflect the automated setup and renumbered steps

## Surprises and Challenges

**Claude Code Trust Command Does Not Exist**: The original spec requested automating `claude trust ../<new-worktree-dir>` to trust the new worktree directory. However, this command does not exist.

Investigation revealed that Claude Code uses:

- `--add-dir <path>` CLI argument at startup (adds directory to working scope, but doesn't "trust" it)
- `/add-dir` slash command during sessions
- `additionalDirectories` in settings files

None of these can be automated from a bash script. The ideal workflow would be to run `claude` from the parent directory (containing both base repo and all sibling worktrees) and have Claude prompt the user to trust that parent directory manually.

**Spec Updates**: Updated all relevant documentation to reflect this limitation:

- `docs/specs/dev-scripts.md` - Added NOTE section explaining the limitation
- `docs/spec-history/start-worktree-fix.md` - Updated title and description to remove auto-trust requirement
- `.claude/commands/change-spec.md` - Added guidance to verify external CLI commands exist before including them in specs

## Testing

Existing unit tests in `src/__tests__/commands/feat.test.ts` continue to pass. The mock scripts used in tests don't simulate `npm install` since they only test workflow state initialization logic. The end-to-end test (run with `RUN_E2E_TESTS=true`) uses the real script and will execute `npm install` when run.
