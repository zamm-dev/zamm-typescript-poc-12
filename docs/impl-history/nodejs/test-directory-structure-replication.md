---
id: XNP353
type: implementation-note
specs:
  - id: MTW997
    path: docs/test-file-resources.md
impl:
  id: IEU463
  path: implementations/nodejs.md
commits:
  - sha: 88ab04da141b7706944e43ac885962ac4285abd7
---

# Test Directory Structure Replication Implementation Plan

## Goal

Implement the requirement from `docs/test-file-resources.md` to replicate directory structure in test resources instead of flattening all files to the same level.

## Current State Analysis

The test fixtures currently exist in:

- `src/__tests__/fixtures/info/` - Various markdown files
- `src/__tests__/fixtures/organize/` - Before/after pairs for organize command

All test files are currently stored flat within their respective command folders.

## Implementation Plan

1. **Review Existing Test Structure** - Examine current test fixtures and understand how they're used
2. **Identify Files That Need Directory Structure** - Check if any test scenarios require files to be in specific directory structures
3. **Restructure Test Fixtures** - If needed, create subdirectories within fixture folders to preserve realistic file hierarchies
4. **Update Test Code** - Modify test utilities and test files to work with new structure
5. **Verify Tests Still Pass** - Run test suite to ensure no regression

## Expected Changes

Based on initial analysis, this may involve:

- Creating subdirectories in test fixtures
- Updating test utilities to handle directory copying
- Ensuring tests maintain their existing behavior

## Risk Assessment

Low risk - this is primarily a refactoring of test structure that shouldn't affect functionality.

## Implementation Results

Successfully implemented the test directory structure replication requirement:

### Changes Made

1. **Info Test Fixtures**: Moved from flat structure to preserve realistic file paths:
   - `spec-file.md` → `docs/features/authentication.md`
   - `project-file.md` → `docs/README.md`
   - `nodejs-impl.md` → `docs/impls/nodejs.md`
   - etc.

2. **Organize Test Fixtures**: Restructured to use before/after folders:
   - Changed from `-before.md`/`-after.md` filename suffixes
   - Created `before/` and `after/` directories with full file structures
   - Example: `spec-before.md` → `before/docs/foo.md`

3. **Test Utilities**: Added new functions to support directory structure:
   - `copyDirectoryFromFixture()` - Copies entire directory trees
   - `expectFileMatchesFixtureFile()` - Compares against files in subdirectories
   - `copyDirectoryRecursive()` - Helper for recursive copying

4. **Test Code Updates**: Modified all organize tests to use new structure
   - Tests now copy entire directory structures instead of individual files
   - File assertions use relative paths within fixture subdirectories

### Verification

- All 28 tests still pass after restructuring
- Tests now better represent realistic file hierarchies
- Setup is simplified by copying entire directory structures
- Assertions verify against complete file paths

### Benefits Achieved

- Test fixtures now preserve realistic directory hierarchies
- Easier to set up complex test scenarios with multiple files
- Better matches real-world file organization
- Follows the requirement exactly as specified in test-file-resources.md
