---
id: ZIV767
type: ref-impl
specs:
  - id: LQO792
    path: /docs/spec-history/cli/organize-update-metadata.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 88aee279edc05a76a21da82d2581fd6b4ba839f1
    message: Implement organize command metadata updates
---

# Organize Command Metadata Updates Implementation

This implementation extends the `organize` command to update derived metadata in reference implementation files, as specified in LQO792.

## Implementation Plan

The `organize` command currently only handles frontmatter for individual files. This implementation will extend it to detect and update derived metadata in reference implementation files (`type: ref-impl`) when organizing files.

The existing codebase already has well-encapsulated logic for setting reference implementation metadata:

- `generateImplementationNote()` in `implement.ts` sets file paths using `resolveFileInfo()`
- `addCommitsToFrontmatter()` in `frontmatter.ts` handles commit data
- `getLastNCommits()` in `git-utils.ts` fetches commit messages

### Phase 1: Extract and Refactor Existing Metadata Logic

**Commit 1: Extract reference implementation metadata update utilities with tests**

- Extract file path update logic from `generateImplementationNote()` into a reusable function `updateReferenceImplPaths()` in `src/core/shared/frontmatter.ts`:
  - Takes a frontmatter object for a reference implementation file
  - Uses `resolveFileInfo()` to locate current file paths for spec and impl IDs
  - Updates `specs[].path` and `impl.path` fields with current paths
  - Returns updated frontmatter object

- Create `updateCommitMessages()` function in `src/core/shared/frontmatter.ts`:
  - Takes a frontmatter object with existing commit SHAs
  - For each commit that lacks a message, fetches it using existing git utilities
  - Updates `commits[].message` fields with fetched messages
  - Returns updated frontmatter object

- **Refactor existing code to use extracted functions**:
  - Update `generateImplementationNote()` in `implement.ts` to use `updateReferenceImplPaths()` for setting file paths
  - Update the commit-setting code to use `updateCommitMessages` as well
  - Ensure all existing functionality remains identical
  - Ensure all existing tests continue to pass

### Phase 2: Integrate Metadata Updates into Organize Command

**Commit 2: Extend organize command to update reference implementation metadata with tests**

- Modify `organizeFile()` function in `src/core/commands/organize.ts`:
  - After detecting file type, check if `fileType === 'ref-impl'`
  - If so, call `updateReferenceImplPaths()` and `updateCommitMessages()` to update derived metadata
  - Apply the updated frontmatter along with the standard organize logic

- Add error handling for cases where referenced files or commits cannot be found

- **Add integration tests for organize command metadata updates**:
  - Add test fixtures for reference implementation files with outdated file paths and missing commit messages
  - Test that `organize` command updates metadata correctly for ref-impl files
  - Test that `organize` command continues to work normally for non-ref-impl files
  - Test error handling when referenced files cannot be found

## Expected Changes

### Files Modified

- `src/core/shared/frontmatter.ts` - Add extracted metadata update functions (`updateReferenceImplPaths`, `updateCommitMessages`)
- `src/core/commands/organize.ts` - Integrate metadata updates into organize command
- `src/core/commands/implement.ts` - Refactor to use extracted `updateReferenceImplPaths` function
- Test files: Add comprehensive tests for new functionality

### Behavior Changes

- When `organize` command processes a `ref-impl` file, it will:
  - Update `specs[].path` fields based on current file locations for the spec IDs
  - Update `impl.path` field based on current file location for the implementation ID
  - Update `commits[].message` fields by fetching current commit messages from Git
  - Preserve all existing metadata while updating only the derived fields

- The logic will be reusable by other commands that need to update reference implementation metadata

### Error Handling

- If a referenced spec/impl file cannot be found by ID, log a warning but continue processing
- If a commit SHA is invalid or not found, preserve the existing message field or set it to empty string
- Ensure the organize command doesn't fail due to metadata update issues

## Implementation Notes

This implementation maintains backward compatibility and only updates derived metadata that can be automatically determined. The core organize functionality (adding IDs, setting types) remains unchanged.

The metadata update logic is designed to be idempotent - running organize multiple times on the same file should produce the same result.

## Implementation Results

### Successfully Completed

✅ **Phase 1: Extract reference implementation metadata update utilities**

- Extracted `updateReferenceImplPaths()` function into `src/core/shared/frontmatter.ts`
- Created `updateCommitMessages()` function for commit message updates
- Refactored existing `implement.ts` to use extracted utilities
- Combined `SpecReference` and `ImplReference` into unified `FileReference` type with optional path

✅ **Phase 2: Integrate metadata updates into organize command**

- Extended `organize` command to detect and update `ref-impl` files
- Added comprehensive error handling for missing files and commits
- Created extensive test coverage including edge cases

### Key Implementation Decisions

**Type System Improvements:**

- Unified `SpecReference` and `ImplReference` interfaces into `FileReference` with optional `path` field
- When files cannot be found, the `path` field is removed entirely rather than keeping outdated paths
- When commits don't exist, the `message` field is removed entirely rather than setting empty strings

**Error Handling:**

- Git stderr output is suppressed to prevent "fatal: ambiguous argument" messages in console
- Console warnings during tests are mocked for cleaner test output
- File resolution failures result in warnings but don't stop processing

**Code Quality:**

- Extracted common logic into reusable `updateFileReference()` function
- Configured ESLint to ignore underscore-prefixed variables in destructuring
- All 62 tests pass including new metadata update test coverage

### Behavior Changes Implemented

The `organize` command now:

- Updates `specs[].path` and `impl.path` fields based on current file locations
- Updates `commits[].message` fields by fetching commit messages from Git
- Removes path/message fields when referenced files/commits cannot be found
- Maintains full backward compatibility for all non-ref-impl files

### Testing Coverage

Added comprehensive tests for:

- Path updates with valid file references
- Commit message updates with valid commits
- Graceful handling of missing file references
- Graceful handling of nonexistent commits
- Console warning suppression during test execution
