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

### Step 1: Setup

- [ ] Add required dependencies
- [ ] Create organize command structure

### Step 2: Core Logic

- [ ] Implement git root detection
- [ ] Implement file type detection
- [ ] Implement ID generation
- [ ] Implement frontmatter parsing/generation

### Step 3: File Operations

- [ ] Read existing file content
- [ ] Parse existing frontmatter if present
- [ ] Generate/update frontmatter
- [ ] Write updated content

### Step 4: Testing

- [ ] Create test files and structure
- [ ] Implement organize command tests
- [ ] Test all file type scenarios
- [ ] Test error conditions

### Step 5: Verification

- [ ] Run all tests
- [ ] Type checking
- [ ] Lint checking
