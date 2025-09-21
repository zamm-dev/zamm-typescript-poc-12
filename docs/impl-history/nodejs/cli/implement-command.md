---
id: MMA086
type: ref-impl
specs:
  - id: FYR697
    path: /docs/specs/cli/README.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 0de40a8ebeedca17adc4b3688b23e4c8b771adb4
  - sha: f0711651afb1ca065afeb72fc3e43b35eb80f74b
---

# Implementation Plan: Implement Command

This document outlines the implementation plan for adding the new `implement` command to the ZAMM CLI as specified in the recent spec changes (commit 8ad71d3).

## Overview

The `implement` command will generate implementation note files in the appropriate `impl-history/` directory when given spec and implementation references.

## Implementation Phases

### Phase 1: Implement Command Core Logic

1. Add `generateImplementationNote()` function to `core.ts`
   - Accept spec ID/path and implementation ID/path
   - Resolve both to actual file paths
   - Validate file types (spec/test and implementation)
   - Create impl-history directory if needed
   - Generate implementation note with proper frontmatter
   - Return path to created file

2. Add `implement` command to `zamm.ts`
   - Command name: `implement` with alias `i`
   - Options: `--spec <spec>` and `--for <impl>`
   - Error handling and user feedback

3. Add comprehensive tests
   - Test file resolution (ID and path)
   - Test directory creation
   - Test frontmatter generation
   - Test error cases (invalid IDs, wrong file types)
   - Reuse existing test fixtures per spec requirements

4. Commit implement command implementation

### Phase 2: Enhanced Info Command

1. Extend `formatFileInfo()` to handle implementation note files
   - Detect implementation-note type
   - Display "Specifications Implemented" section
   - Display "Implementation" section
   - Resolve IDs to file paths for display

2. Add tests for enhanced info functionality
   - Test implementation note info display
   - Test spec and impl reference resolution

3. Commit info command enhancements

## Technical Details

### File Structure

- Implementation notes go in sibling `impl-history/` directory of spec
- File naming: `new-{specId}-impl.md`
- Generated IDs use existing RandomIdProvider

### Frontmatter Structure

```yaml
---
id: NOT123
type: implementation-note
specs:
  - id: XYZ789
    path: /docs/specs/features/authentication.md
impl:
  id: IMP002
  path: /docs/impls/python.md
---
```

### Error Handling

- Invalid spec/impl IDs or paths
- Wrong file types
- Missing directories
- Git repository detection

## Test Strategy

- Reuse existing test fixtures from info command tests
- Add implementation note fixture
- Test both ID and path resolution
- Test error conditions
- Integration tests for full command flow

## Implementation Results

### Phase 1: Implement Command (✅ COMPLETED)

**Key Learnings:**

- Successfully refactored to reuse existing `resolveFileInfo()` helper instead of duplicating file resolution logic
- The existing error handling from `resolveFileInfo()` was sufficient - no need to rethrow custom error messages
- Test fixtures work well with existing `createTestFileFromFixture()` infrastructure

**Implementation Details:**

- Added `generateImplementationNote()` function with clean interface
- Reused `resolveFileInfo()` for consistent file resolution behavior
- Added `implement` command with `--spec` and `--for` options and alias `i`
- Created 9 comprehensive tests covering all scenarios
- All tests pass, including edge cases and error conditions

### Phase 2: Enhanced Info Command (✅ COMPLETED)

**Key Learnings:**

- Extended `formatFileInfo()` to handle implementation-note files without breaking existing functionality
- Used proper type checking and filtering to handle malformed frontmatter gracefully
- Following test-file-resources spec improved test maintainability significantly

**Implementation Details:**

- Enhanced `formatFileInfo()` to display "Specifications Implemented" and "Implementation" sections
- Added robust frontmatter validation with graceful fallback for malformed data
- Created proper test fixture files following test-file-resources spec:
  - `initial-auth.md` - basic implementation note
  - `multi-spec.md` - multiple specifications
  - `malformed.md` - incomplete frontmatter
- Added 4 comprehensive test cases, all passing

**Architectural Insights:**

- The modular design allowed clean extension without breaking changes
- Reusing existing `parseFrontmatter()` function maintained consistency
- TypeScript type assertions provided good balance of safety and flexibility

**Final Status:**

- Both commands fully implemented with comprehensive test coverage
- All 41 tests passing
- Code follows existing patterns and conventions
- Ready for production use
