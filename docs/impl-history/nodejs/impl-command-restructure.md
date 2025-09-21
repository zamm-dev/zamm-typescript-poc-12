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

### Phase 2: Add `impl record` Subcommand

**New functionality needed:**

1. `impl record` subcommand with `--last-n-commits <N>` option and positional argument for the target implementation ID or file path
2. Logic to:
   - Get the last N commit SHAs using git commands
   - Resolve the reference implementation ID or file path using existing file resolution utilities
   - Parse the frontmatter of the resolved implementation file
   - Add commit SHAs to the `commits:` array in the frontmatter
   - Write the updated file back

**Implementation approach:**

1. Add git utility functions to get commit history
2. Add frontmatter manipulation utilities (may already exist)
3. Leverage existing `resolveFileInfo()` function for ID/path resolution (consistent with other commands)
4. Create new command handler in `implement.ts` or separate file
5. Wire up the CLI command in `zamm.ts`

### Phase 3: Testing and Documentation

**Testing:**

1. Update existing tests for the renamed command structure
2. Add tests for the new `impl record` functionality
3. Test git integration and frontmatter manipulation

**Documentation:**

1. Update help text and descriptions
2. Update any documentation that references the old command names

## Technical Implementation Details

### Command Structure (Phase 1)

```typescript
// In src/zamm.ts
const implCommand = program
  .command('impl')
  .alias('i')
  .description('Implementation management commands');

implCommand
  .command('create')
  .description(
    'Generate reference implementation file for a spec and implementation'
  )
  .requiredOption('--spec <spec>', 'spec file ID or path')
  .requiredOption('--for <impl>', 'implementation file ID or path')
  .action(implementWithErrorHandling);
```

### New Record Command (Phase 2)

```typescript
implCommand
  .command('record')
  .description('Record commit hashes in implementation file')
  .requiredOption(
    '--last-n-commits <n>',
    'number of recent commits to record',
    parseInt
  )
  .argument(
    '<id-or-path>',
    'reference implementation ID or file path to update'
  )
  .action(recordCommitsWithErrorHandling);
```

### Git Integration

New utility functions needed:

```typescript
// In src/core/shared/git-utils.ts (new file)
import { Commit } from './types.js';

export function getLastNCommits(n: number): Commit[];
export function isGitRepository(): boolean;
```

### Type Definitions

Add new types to existing types file:

```typescript
// In src/core/shared/types.ts
export interface Commit {
  sha: string;
}
```

## Implementation Order

1. **Rename and restructure commands** (Phase 1)
   - Update CLI structure in `zamm.ts`
   - Ensure all existing functionality works
   - Update tests

2. **Add git utilities** (Phase 2a)
   - Create git utility functions
   - Add tests for git operations

3. **Implement record command** (Phase 2b)
   - Add frontmatter manipulation
   - Wire up the new command
   - Add tests

4. **Integration testing** (Phase 3)
   - Test the complete workflow
   - Update documentation

## Commit Strategy

This implementation will be split into two commits:

1. **First commit**: Rename `implement` command to `impl` and move existing functionality to `impl create` subcommand
   - Update CLI command structure in `zamm.ts`
   - Ensure existing functionality works under new command structure
   - Update tests for the renamed commands
   - This commit maintains all existing functionality while changing the command interface

2. **Second commit**: Add `impl record` subcommand with git integration
   - Add git utility functions
   - Add frontmatter manipulation for commits
   - Implement the new `impl record` command
   - Add tests for the new functionality
   - This commit adds the new feature without affecting existing functionality

## Success Criteria

- `impl create` works exactly like the old `implement` command
- `impl record --last-n-commits 3 <id-or-path>` successfully adds 3 recent commit SHAs to the specified reference implementation file's frontmatter (works with both ID and file path)
- All existing tests pass with updated command names
- CLI help and documentation reflect the new structure
- Backward compatibility maintained where possible
