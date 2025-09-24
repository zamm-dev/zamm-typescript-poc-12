---
id: RAN494
type: ref-impl
specs:
  - id: RTD017
    path: /docs/spec-history/cli/fix-feat-start-spec-history.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 865ca65cadbbadaaec13c1ed92d3c1901e6c95fe
    message: Fix feat start spec history file creation in worktree
---

# Fix feat start spec history file creation

## Implementation Summary

Fixed a bug in the `feat start` command where spec history files were being created in the base project directory instead of the worktree directory.

## Changes Made

1. **Core Fix in `feat.ts`**: Changed the spec file creation logic to use `siblingPath` (worktree directory) instead of `gitRoot` (base repository directory) at lines 112-117.

2. **Test Update**: Modified the test in `feat.test.ts` to properly verify the spec file is created in the worktree using a modified `TestEnvironment` pointing to the worktree path.

## Implementation Notes

- The fix was straightforward - just changing one variable reference in the path construction
- The test needed to be updated to reflect the correct expected behavior
- All existing tests continue to pass, confirming no regression
- The solution maintains the existing API and behavior, just fixes the file location
