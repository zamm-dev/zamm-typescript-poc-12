---
id: IH001
type: impl-history
---

# Implementation: Move Test Specs to specs/ Directory

## Context

Commit 45e6b2d changed the test specifications to expect spec files to be located under `docs/specs/` instead of directly under `docs/`.

## Changes Required

### Test Fixtures

The test fixtures need to be updated to reflect the new directory structure:

1. **Info command test fixtures**: Update paths from `docs/features/` to `docs/specs/features/`
2. **Organize command test fixtures**: Update test cases to use `docs/specs/` paths

### Core Implementation

Review if the core logic needs any updates to handle the new directory structure:

1. Check if the `getFileType()` function needs to recognize `docs/specs/` as a valid spec location
2. Verify path handling in the organize command

### Test Files

Update test files to match the new spec requirements:

1. `src/__tests__/info.test.ts`: Update expected paths and fixture paths
2. `src/__tests__/organize.test.ts`: Update test cases for spec files

## Expected Outcome

- Tests should pass with spec files located under `docs/specs/`
- The organize command should correctly identify spec files in the new location
- The info command should display correct paths for spec files
