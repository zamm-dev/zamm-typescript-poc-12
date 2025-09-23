---
id: NVO753
type: ref-impl
specs:
  - id: ZWS823
    path: /docs/spec-history/cli/impl-command-type-check.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 70609a8aff9583c96a6d5a8801d627445d1abc52
    message: Implement type validation for impl record command
---

# Implementation Plan: Type-check implementation file type before recording Git commits

## Summary

This implementation adds type validation to the `impl record` command to ensure that commits can only be recorded to reference implementation files (`type: ref-impl`). According to the spec, if the target file is not a reference implementation, the command should exit with a descriptive error message.

## Current State Analysis

Based on examination of the current codebase:

1. **Current `recordCommits` function** (`src/core/commands/implement.ts:119-144`):
   - Takes an ID or path and validates basic file existence and frontmatter structure
   - Does NOT validate the file type before recording commits
   - Uses `resolveFileInfo()` to get file information including the detected type

2. **File type detection** (`src/core/shared/file-resolver.ts:7-31`):
   - `detectFileType()` correctly identifies `ref-impl` files based on path patterns
   - Files in `/impl-history/` directories are correctly typed as `ref-impl`
   - Spec files are typed as `spec`, implementation files as `implementation`

3. **Existing tests** (`src/__tests__/commands/implement.test.ts`):
   - Tests cover basic `recordCommits` functionality
   - Tests cover error cases for missing files, missing frontmatter, and git repository issues
   - NO existing tests for type validation

## Implementation Plan

### Phase 1: Add type validation to recordCommits function

**Goals:**

- Modify `recordCommits` function to validate file type before processing
- Add descriptive error message when attempting to record commits to non-ref-impl files
- Ensure error message format matches spec requirements

**Changes:**

- Add type validation check in `recordCommits` function after `resolveFileInfo()` call
- Add conditional logic to check if `fileInfo.type !== 'ref-impl'`
- Generate appropriate error message format: "Error: Implementation commits have to be added to implementation files. The file you entered, {Type} {ID} at {path}, is a {type description} file."

### Phase 2: Add comprehensive test coverage

**Goals:**

- Add test cases to verify type validation works correctly
- Test error message format and content
- Ensure existing functionality remains intact

**Test cases to add:**

1. Test recording commits to spec file (should fail with error)
2. Test recording commits to implementation file (should fail with error)
3. Test recording commits to project file (should fail with error)
4. Verify error message format matches spec exactly
5. Ensure ref-impl files still work (regression test)

**Required test fixtures:**

- Create spec file fixture for testing type validation
- Create implementation file fixture for testing type validation
- Update existing fixtures if needed

### Phase 3: Verify and commit

**Goals:**

- Run full test suite to ensure no regressions
- Run linting and type checking
- Verify all new functionality works as specified

This is a straightforward single-phase implementation since the changes are localized to one function and the test additions are straightforward. The implementation should preserve all existing functionality while adding the new validation requirement.

## Implementation Results

### Completed Implementation

The implementation was completed successfully in a single phase as planned. All three phases were executed.

### Implementation Notes

- Type labels are shortened for files other than specifications (e.g., "Implementation" → "Impl", "Project" → "Proj")
