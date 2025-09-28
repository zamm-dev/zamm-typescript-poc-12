---
id: GQH403
type: ref-impl
specs:
  - id: FYR697
    path: /specs/cli/README.md
  - id: LLM115
    path: /specs/cli/organize/tests/all-files.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 522ec78049fc801377ba0916dbe42ed284001861
    message: Implement organize command with no arguments to process all docs files
note: Update `organize` command to optionally take in no arguments.
---

# Organize All Files Implementation Plan

## Objective

Implement the "no arguments" functionality for the organize command that processes all files under the `docs/` directory.

## Current State Analysis

- CLI already has organize command for single files in `src/cli.ts:38-43`
- Core organization logic exists in `src/organizer.ts` with `organizeFile()` function
- Existing test infrastructure supports single file operations
- ID provider injection system already in place for deterministic testing

## Implementation Plan

### 1. Core Functionality

- Add `organizeAllFiles()` function to `src/organizer.ts`
- Function should:
  - Find all `.md` files under `docs/` directory recursively
  - Process files in deterministic order (sorted by path)
  - Use existing `organizeFile()` function for each file
  - Skip files that aren't markdown

### 2. CLI Integration

- Modify organize command in `src/cli.ts` to:
  - Make file argument optional
  - When no file provided, call `organizeAllFiles()`
  - Maintain existing single-file behavior when file is provided

### 3. Testing

- Add comprehensive test for organize-all-files functionality
- Test should:
  - Set up temp directory with multiple markdown files
  - Use mock ID provider for deterministic results
  - Verify all files are organized correctly
  - Ensure processing order is consistent

## Expected Changes

- `src/organizer.ts`: Add `organizeAllFiles()` function
- `src/cli.ts`: Modify organize command to handle optional file argument
- `src/__tests__/cli.test.ts`: Add test for organize-all-files

## Risk Assessment

- Low risk: Building on existing, tested functionality
- Main concern: Ensuring deterministic file processing order for testing

## Implementation Results

### Successful Implementation ✅

**Core Functionality:**

- Added `organizeAllFiles()` function to `src/organizer.ts:155-172` that recursively finds and processes all markdown files in `docs/`
- Added `findMarkdownFiles()` helper function with deterministic sorting (`src/organizer.ts:131-153`)
- Function processes files in consistent alphabetical order by full path

**CLI Integration:**

- Modified organize command to accept optional file argument (`src/cli.ts:47-50`)
- Updated error handling to support both single file and batch operations (`src/cli.ts:27-41`)
- Command now supports both `zamm organize file.md` and `zamm organize` (processes all docs)

**Testing:**

- Added comprehensive test suite for organize-all-files functionality (`src/__tests__/cli.test.ts:134-173`)
- Updated MockIdProvider to handle multiple IDs for deterministic batch testing (`src/__tests__/cli.test.ts:7-18`)
- Tests verify correct file type detection and ID assignment for all file types
- All 10 tests passing ✅

**Key Insights:**

- File processing order: README.md → impl-history/ → impls/ → spec files → tests/
- Critical to sort directory entries during traversal for deterministic behavior
- Pre-commit hooks automatically formatted code during commit process

**Final Status:** Implementation complete and fully tested. Feature ready for use.
