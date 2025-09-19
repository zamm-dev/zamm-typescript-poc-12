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
