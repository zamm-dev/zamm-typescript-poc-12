---
id: SST469
type: ref-impl
specs:
  - id: JDK025
    path: /docs/spec-history/top-level-impl-history.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
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
