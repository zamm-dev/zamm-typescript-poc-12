---
id: ZBE551
type: ref-impl
specs:
  - id: NPO640
    path: /spec-history/description-title-args.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 24f44811ff71604fb431f50931c659f60419b179
    message: Add testing guidance to implement-spec workflow
  - sha: 00f5e9580238246184e051d7ebc221f751362102
    message: Use zamm spec changelog --description in start-worktree.sh
---

# Implementation: Use `--description` argument in start-worktree.sh

## Overview

Modified `dev/start-worktree.sh` to use the `zamm spec changelog --description` command instead of manually generating titles with aichat and appending content.

## Changes Made

### Modified Files

1. **dev/start-worktree.sh**
   - Removed separate `aichat` call for title generation
   - Removed manual `printf` append operation
   - Replaced with single `zamm spec changelog "$spec_path" --description "$description"` call
   - The `--description` argument triggers automatic title generation via the command's built-in Anthropic integration

2. **src/**tests**/commands/feat.test.ts**
   - Added `package.json` creation in E2E test setup
   - Required because `start-worktree.sh` runs `npm install` in the worktree
   - Without this, the E2E test fails with "ENOENT: no such file or directory" error

## Key Implementation Details

The `zamm spec changelog` command (in `src/core/commands/spec.ts`) already had the `--description` and `--title` arguments implemented. When `--description` is provided without `--title`, it automatically calls `anthropicService.suggestSpecTitle(description)` to generate an appropriate title.

## Issues Encountered

### E2E Test Failure

- **Issue**: E2E test failed because `npm install` couldn't find `package.json` in the test worktree
- **Root Cause**: Test setup only created README files, not a complete project structure
- **Solution**: Added `package.json` creation to the test repository initialization (lines 153-164 in feat.test.ts)

### Pre-existing Test Failures

- **Issue**: Several tests in `implement.test.ts`, `organize.test.ts`, and `spec.test.ts` were failing with commit SHA mismatches
- **Root Cause**: Timezone change affected deterministic commit generation (not related to this implementation)
- **Resolution**: Verified via `git stash` that failures existed before changes were made

## Testing

Ran E2E tests with `RUN_E2E_TESTS=true npm test -- --testPathPatterns=feat.test.ts`. All 4 tests passed after adding the `package.json` fix.
