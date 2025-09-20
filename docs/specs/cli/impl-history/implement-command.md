---
id: MMA086
type: implementation-note
specs:
  - id: FYR697
    path: /docs/specs/cli/README.md
impl:
  id: IEU463
    path: /docs/impls/nodejs.md
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
