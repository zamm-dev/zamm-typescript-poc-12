---
id: USA133
type: ref-impl
specs:
  - id: FYR697
    path: /docs/specs/cli/README.md
  - id: MLM844
    path: /docs/specs/cli/tests/organize-single-file.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 9b27159ce9b1f068526f413f669bf181c8bb9015
    message: Implement CLI organize command with YAML frontmatter generation
note: >-
  Initial implementation of `organize` command that takes in single filename as
  argument.
---

# Implementation Plan: CLI Organize Command

## Goal

Implement the `organize` command for the ZAMM CLI that adds proper YAML frontmatter to markdown files.

## Requirements Analysis

From `docs/cli/README.md` and `docs/cli/tests/organize-single-file.md`:

1. **Command**: `organize` or `o`
2. **Input**: Single file path
3. **Output**: Rewrite file with YAML frontmatter

### Frontmatter Structure

```yaml
---
id: XXX000 # 3 capital letters + 3 numbers (random)
type: <type> # determined by file location
---
```

### Type Detection Logic

- `project`: file is `docs/README.md` (root)
- `implementation`: file is in `docs/impls/` folder
- `implementation-note`: file is inside an `impl-history/` parent folder
- `test`: file is inside a `tests/` parent folder
- `spec`: all other files

### Root Detection

- Root is determined relative to `.git` directory
- Command should error if no `.git` directory found

## Implementation Plan

1. **Add dependencies**: yaml parsing/generation library if needed
2. **Create organize command**: Add to existing CLI structure
3. **File type detection**: Implement path-based type detection logic
4. **Git root detection**: Find `.git` directory for relative path calculation
5. **Frontmatter handling**:
   - Check if frontmatter already exists
   - Generate random ID if needed
   - Insert/update frontmatter
6. **File rewriting**: Write updated content back to file
7. **Tests**: Implement comprehensive test suite
8. **Error handling**: Proper error messages for edge cases

## Technical Implementation Notes

### Dependencies to Consider

- `js-yaml` or similar for YAML handling
- `fs` for file operations
- `path` for path manipulation

### Command Structure

```typescript
program
  .command('organize')
  .alias('o')
  .description('Add proper YAML frontmatter to markdown files')
  .argument('<file>', 'file to organize')
  .action(organizeFile);
```

## Test Coverage Required

- Spec file organization
- Project file organization
- Implementation file organization
- Implementation note file organization
- Test file organization
- Error cases (no git repo, invalid file, etc.)

## Implementation Progress

### Step 1: Setup ✅

- [x] Add required dependencies (`js-yaml` and `@types/js-yaml`)
- [x] Create organize command structure

### Step 2: Core Logic ✅

- [x] Implement git root detection
- [x] Implement file type detection
- [x] Implement ID generation
- [x] Implement frontmatter parsing/generation

### Step 3: File Operations ✅

- [x] Read existing file content
- [x] Parse existing frontmatter if present
- [x] Generate/update frontmatter
- [x] Write updated content

### Step 4: Testing ✅

- [x] Create test files and structure
- [x] Implement organize command tests
- [x] Test all file type scenarios
- [x] Test error conditions

### Step 5: Verification ✅

- [x] Run all tests
- [x] Type checking
- [x] Lint checking

## Implementation Results

### Successful Implementation

The organize command was successfully implemented with all requirements met:

- Command alias `o` works correctly
- File type detection follows specification exactly
- ID generation creates proper 6-character format (3 letters + 3 numbers)
- Git root detection prevents usage outside repositories
- Existing frontmatter preservation works correctly

### Architectural Decisions

1. **Modular Design**: Split CLI logic from core organizer functionality into separate files (`cli.ts` vs `organizer.ts`)
2. **Dependency Injection**: Implemented IdProvider interface for testable ID generation
3. **Test Fixtures**: Used separate before/after files instead of inline strings for better maintainability

### Implementation Surprises & Solutions

#### TypeScript ES Modules Issues

**Problem**: Initial Jest configuration failed with ES modules imports from chalk/commander
**Solution**: Simplified approach by separating organizer logic into CommonJS-compatible module

#### Frontmatter Body Parsing

**Problem**: Extra newlines caused test failures when parsing existing frontmatter
**Solution**: Added `.trim()` to body parsing to normalize whitespace consistently

#### Linting Strictness

**Problem**: ESLint flagged `any` types and unsafe assignments in YAML parsing
**Solution**: Created proper `Frontmatter` interface with type safety

### Final Architecture

```
src/
├── cli.ts           # Commander CLI with error handling
├── organizer.ts     # Core logic with dependency injection
└── __tests__/
    ├── cli.test.ts  # Comprehensive test suite
    └── fixtures/    # Before/after test files
        └── organize/
```

### Test Coverage

- All file types (project, implementation, implementation-note, test, spec)
- Error conditions (missing files, no git repo)
- Existing frontmatter preservation
- Deterministic ID generation via mocks
