---
id: FTY087
type: ref-impl
specs:
  - id: TYH425
    path: /docs/spec-history/cli/split-up-file.md
impl:
  id: IEU463
  path: /docs/impls/nodejs.md
commits:
  - sha: 9f7f818ad3f6451b9b783d3647f0368194222f8c
    message: Update split command to support multiple files and match CLI structure
  - sha: cc47a0fe3938b88738b42ef3636d8be8ab6e30df
    message: Implement split command for file reorganization
---

# NodeJS Implementation of Split Command

This document tracks the implementation of the split command (spec TYH425) for the NodeJS ZAMM CLI.

## Implementation Overview

The split command allows users to split content from a main file into new separate files. The behavior depends on whether the main file is already named `README.md`:

- **If main file is `README.md`**: Create new files in the same directory
- **If main file is not `README.md`**: Create a folder with the file's name, move main file to `README.md` in that folder, and create new files there

## Key Components

### Core Implementation

- `src/core/commands/split.ts` - Main split command logic
- `SplitOptions` interface matching CLI structure with `newFileNames` array
- Frontmatter generation for new files inheriting type from parent

### CLI Integration

- `src/zamm.ts` - CLI command with `--into <filenames...>` syntax supporting multiple files
- Error handling and user feedback

### Testing

- `src/__tests__/commands/split.test.ts` - Comprehensive test suite with 10 test cases
- Test fixtures for different scenarios (regular file, existing README, multiple files)
- Coverage of error conditions and edge cases

## Implementation Results

The implementation was completed successfully with all tests passing. Key features:

1. **Single and Multiple File Support**: Can split into one or multiple files in a single operation
2. **Automatic Extension Handling**: Appends `.md` extension if not provided
3. **Type Inheritance**: New files inherit the same frontmatter type as parent
4. **Proper Error Handling**: Clear error messages for various failure conditions
5. **Comprehensive Testing**: 10 test cases covering all scenarios

No unexpected errors or surprises were encountered during implementation.
