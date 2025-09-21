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
