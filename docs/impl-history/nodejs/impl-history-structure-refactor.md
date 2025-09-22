---
id: SST469
type: ref-impl
specs:
  - id: JDK025
    path: /docs/spec-history/top-level-impl-history.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 611b78ce687c957b1b0a0e85e9f56aaebbce76eb
    message: Update implement command for new directory structure
---

# Implementation Plan: Update Code for Impl-History Directory Structure

## Summary

Spec JDK025 requires moving all `impl-history/` folders from `docs/specs/` to `docs/impl-history/<implementation>/`. While the spec files _for ZAMM_ have been updated to reflect this change, the actual project code needs to be updated to generate files in the new directory structure for all other projects that use ZAMM.

## Current Implementation Analysis

The `implement` command currently generates files in `docs/specs/<spec-path>/impl-history/` but according to the updated specs, it should generate files in `docs/impl-history/<implementation>/<spec-path>` based on the target implementation.

## Required Code Changes

### 1. Update `implement` Command Logic

- **File**: `src/core.ts` (implement command logic)
- **Change**: Modify the path generation logic to use `docs/impl-history/<implementation>/` instead of `docs/specs/<spec-path>/impl-history/`
- **Details**:
  - Extract implementation name from the `--for` parameter (for example, if the referenced file is a `docs/impls/nodejs-rewrite.md` file, then the implementation name will be `nodejs-rewrite`)
  - Generate output path under `docs/impl-history/<impl-name>/`, following the same output path of the spec file in question. For example, if the spec is at `docs/specs/features/authentication.md` or `docs/spec-history/features/change-to-authentication.md`, the generated path should be `docs/impl-history/<impl-name>/features/new-XXX123-impl.md`

### 2. Update Path Resolution Logic

- **File**: `src/core.ts` (path utilities)
- **Change**: Update any hardcoded paths that reference the old structure
- **Details**: Ensure relative path calculations work with the new structure

### 3. Update Tests

- **Files**: `src/__tests__/implement.test.ts` and related test fixtures
- **Change**: Update test expectations to match new directory structure
- **Details**:
  - Update expected output paths in tests
  - Update test fixtures if they reference the old paths
  - Ensure tests verify correct directory creation

## Implementation Strategy

**Single Commit**: Update implement command for new directory structure

- Modify `implement` command to use new directory structure in `src/core.ts`
- Update path generation logic to extract implementation name and preserve spec directory structure
- Update test expectations and fixtures to match new paths
- Verify all tests pass with new directory structure

## Testing Strategy

- Run existing tests (with modified paths) to ensure no regression

## Implementation Results

**Successfully Implemented**: ✅ **Single Commit**: Update implement command for new directory structure (commit 611b78c)

### Changes Made

1. **Updated `generateImplementationNote` function in `src/core.ts`**:
   - Modified path generation logic to use `docs/impl-history/<implementation>/` instead of `docs/specs/<spec-path>/impl-history/`
   - Added extraction of implementation name from implementation file path using `path.basename(implInfo.absolutePath, '.md')`
   - Updated spec directory structure calculation to preserve relative path from specs or spec-history
   - Fixed macOS symlink path resolution issue using `fs.realpathSync()` to normalize paths

2. **Updated all test expectations in `src/__tests__/implement.test.ts`**:
   - Changed expected output paths from `/docs/specs/features/impl-history/` to `/docs/impl-history/python/features/`
   - Updated test directory structure expectations for proper validation
   - Fixed test for CLI tests path structure from `/docs/specs/cli/tests/impl-history/` to `/docs/impl-history/python/cli/tests/`

3. **Path Generation Logic**:
   - For specs in `docs/specs/features/authentication.md` → generates to `docs/impl-history/<impl-name>/features/`
   - For specs in `docs/specs/cli/tests/info-command.md` → generates to `docs/impl-history/<impl-name>/cli/tests/`
   - Maintains directory structure preservation as specified

### Unexpected Issues Encountered

1. **macOS Symlink Issue**: Encountered path resolution problems on macOS where `/var` is a symlink to `/private/var`. This caused `path.relative()` to return incorrect relative paths with `../` segments.
   - **Solution**: Used `fs.realpathSync()` to normalize both the git root and spec file paths before calculating relative paths.

2. **Test Path Expectations**: Had to carefully update all test regex patterns to match the new directory structure while ensuring they remained specific enough to catch regressions.

### Verification

- ✅ All 41 tests pass
- ✅ Linting passes with no errors
- ✅ TypeScript compilation successful
- ✅ Build generates executable successfully
- ✅ Pre-commit hooks run successfully with formatting and linting

The implementation correctly follows the new directory structure as specified in JDK025, generating implementation files in `docs/impl-history/<implementation>/` while preserving the original spec directory structure.
