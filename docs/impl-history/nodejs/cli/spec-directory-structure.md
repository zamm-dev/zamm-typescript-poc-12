---
id: TTZ448
type: impl-history
specs:
  - id: SOB239
    path: /docs/specs/cli/info/tests.md
  - id: MLM844
    path: /docs/specs/cli/organize/tests/single-file.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 5fc5b2b3959f7f4141b8b4d4e6574508337d2b49
    message: Implement spec directory structure change
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

## Implementation Results

### Changes Made

1. **Core Logic (`src/core.ts`)**:
   - Updated `detectFileType()` function to explicitly check for `docs/specs/` path and return 'spec' type
   - No other changes needed as the fallback still returns 'spec' for unmatched paths

2. **Test Fixtures**:
   - Moved `src/__tests__/fixtures/info/docs/features/authentication.md` to `src/__tests__/fixtures/info/docs/specs/features/authentication.md`
   - Moved `src/__tests__/fixtures/organize/before/docs/foo.md` to `src/__tests__/fixtures/organize/before/docs/specs/foo.md`
   - Moved `src/__tests__/fixtures/organize/after/docs/foo.md` to `src/__tests__/fixtures/organize/after/docs/specs/foo.md`

3. **Test Files**:
   - Updated `src/__tests__/info.test.ts` to use `docs/specs/features/` paths
   - Updated `src/__tests__/organize.test.ts` to use `docs/specs/` paths for spec file tests

### Surprises and Notes

- The user initially requested to move files instead of copying when restructuring test fixtures
- ESLint automatically formatted the test files during the pre-commit hook
- All tests passed on the first run after implementation, indicating the changes were sufficient

### Test Results

All 28 tests passed successfully:

- 10 organize command tests
- 18 info command tests
