---
id: LJS789
type: ref-impl
specs:
  - id: YSI785
    path: /docs/spec-history/impl-record-commits.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
---

# Implementation Plan: Restructure Implement Command

This document outlines the implementation plan for restructuring the `implement` command according to spec YSI785.

## Overview

The spec requires:

1. Rename the existing `implement` command to `impl`
2. Move the current `impl` functionality to an `impl create` subcommand
3. Add a new `impl record` subcommand that takes `--last-n-commits <N>` and a positional argument for the reference implementation ID or file path to edit, then adds commit hashes to that file

## Current State Analysis

The current implementation has:

- `implement` command in `src/zamm.ts:98-106` with alias `i`
- Implementation logic in `src/core/commands/implement.ts`
- Command takes `--spec` and `--for` options
- Generates reference implementation files in `docs/impl-history/` structure

## Implementation Plan

### Phase 1: Rename Command and Create Subcommand Structure

**Files to modify:**

- `src/zamm.ts` - Update CLI command structure
- `src/core/commands/implement.ts` - Rename/refactor as needed
- `src/core/index.ts` - Update exports if needed

**Changes:**

1. Replace the current `implement` command with `impl` command
2. Create `impl create` subcommand with existing functionality
3. Maintain backward compatibility with the `i` alias pointing to `impl`
4. Keep existing `--spec` and `--for` options on the `create` subcommand
5. Update existing tests for the renamed command structure

### Phase 2: Add Git Utility Functions

**New functionality needed:**

1. Git utility functions to get commit history
2. Type definitions for commit data
3. Tests for git operations with reproducible commit SHAs

**Implementation approach:**

1. Create `src/core/shared/git-utils.ts` with functions to get last N commits
2. Add `Commit` interface to `src/core/shared/types.ts`
3. Add comprehensive tests that ensure reproducible commit SHA retrieval

### Phase 3: Implement `impl record` Subcommand with Frontmatter Manipulation

**New functionality needed:**

1. `impl record` subcommand with `--last-n-commits <N>` option and positional argument for the target implementation ID or file path
2. Frontmatter manipulation utilities for commits array
3. Logic to:
   - Resolve the reference implementation ID or file path using existing file resolution utilities
   - Parse the frontmatter of the resolved implementation file
   - Add commit SHAs to the `commits:` array in the frontmatter
   - Write the updated file back

**Implementation approach:**

1. Add frontmatter manipulation utilities (may already exist)
2. Leverage existing `resolveFileInfo()` function for ID/path resolution (consistent with other commands)
3. Create new command handler using git utilities from Phase 2
4. Wire up the CLI command in `zamm.ts`
5. Add comprehensive tests for the new functionality
6. Update help text and documentation

## Success Criteria

- `impl create` works exactly like the old `implement` command
- `impl record --last-n-commits 3 <id-or-path>` successfully adds 3 recent commit SHAs to the specified reference implementation file's frontmatter (works with both ID and file path)
- All existing tests pass with updated command names
- CLI help and documentation reflect the new structure
- Backward compatibility maintained where possible

## Implementation Results

### Successfully Implemented

✅ **Phase 1: Command Restructure**

- Renamed `implement` command to `impl` with subcommand structure
- Moved existing functionality to `impl create` subcommand
- Maintained backward compatibility with `i` alias
- All existing `generateImplementationNote` functionality preserved

✅ **Phase 2: Git Utilities**

- Created `src/core/shared/git-utils.ts` with `getLastNCommits()` and `isGitRepository()` functions
- Added `Commit` interface to `src/core/shared/types.ts`
- Integrated with existing frontmatter utilities

✅ **Phase 3: impl record Subcommand**

- Implemented `impl record --last-n-commits <N> <id-or-path>` command
- Added `recordCommits()` function in `implement.ts`
- Created frontmatter manipulation utilities (`serializeFrontmatter`, `addCommitsToFrontmatter`)
- Supports both ID and file path resolution
- Prepends new commits to existing commits array (most recent first)

✅ **Testing**

- All existing tests updated for new command structure
- Added comprehensive tests for `recordCommits` functionality
- Created git test utilities for deterministic commit generation
- Refactored to use exact file content matching per test-file-resources specification
- All 47 tests passing

### Surprises and Issues Encountered

🔧 **Test Infrastructure Improvements**

- Initially used `toContain` assertions but user feedback required refactoring to exact file matching per test-file-resources specification for better precision
- User pointed out code duplication in git setup and requested creation of shared `git-test-utils.ts` for deterministic commit generation across tests
- User corrected approach: git-test-utils should only set up commits, not return SHAs - use existing `getLastNCommits` for SHA retrieval
- User moved test fixtures under `implement/` directory structure and constrained against editing test resources further
- Required adapting test environment setup and copy/assert functions to work with new fixture organization
- Multiple rounds of back-and-forth to get test structure and fixture organization correct
- Deterministic commit SHAs: `e779995e60790757d2ed7e3ff8e87a2617e8c3c6`, `4bd28bec045891fff0ccb1e549d88f17f34d6827`, `37029ec0f2bc27ce51a21c18293d49923706bf9f`

🎯 **Error Handling**

- Proper validation for git repository existence
- Clear error messages for missing files and invalid frontmatter
- Graceful handling of files without proper YAML frontmatter

🚀 **CLI Structure**

- Commander.js subcommand structure works seamlessly
- Help system automatically generates proper nested help
- Both `zamm impl create` and `zamm i create` work as expected
- Both `zamm impl record` and `zamm i record` work as expected

### Final Status

The implementation fully meets the spec requirements:

- ✅ `impl create` replaces `implement` with identical functionality
- ✅ `impl record --last-n-commits <N> <id-or-path>` successfully records commit hashes
- ✅ Works with both file IDs and file paths
- ✅ Prepends new commits to existing commits array
- ✅ All existing tests pass
- ✅ New comprehensive test coverage for record functionality
- ✅ Backward compatibility maintained with `i` alias
