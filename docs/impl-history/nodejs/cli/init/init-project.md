---
id: ZJC238
type: ref-impl
specs:
  - id: TCN856
    path: /specs/cli/init/project.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 1459a06e7fcf5a18e114cb3299cbc16ca9e9188c
    message: Add zamm init project command
---

# `zamm init project` Implementation

## Implementation Approach

Created a new `prompt-utils.ts` service following the singleton pattern (like IdProvider) to handle terminal I/O with dependency injection for testing. The `initProject` command uses this service to prompt for project details interactively.

## Key Implementation Details

- **Terminal I/O Service**: Created `PromptService` interface with `getPromptService()` and `setPromptService()` for dependency injection
- **Directory Normalization**: Both project directory names and stack filenames are normalized by converting to lowercase, replacing spaces/special characters with hyphens
- **Git Operations**: Used `execSync` with `stdio: 'pipe'` to suppress git command output during initialization
- **CLI Integration**: Added optional command-line parameters (`--project-title`, `--project-description`, `--initial-stack`) for non-interactive usage

## Testing Notes

- **Mock Strategy**: Use `jest.fn()` with chained `.mockResolvedValueOnce()` calls instead of custom mock classes - this enables assertions on prompt calls
- **Console Suppression**: Suppress `console.log` in tests (not just `console.warn`) since the command prints success messages
- **Fixture Organization**: Follow test-file-resources spec - create fixture files at the exact expected output paths (e.g., `expected/task-management-application/base/docs/README.md`) for use with `expectFileMatches()`
- **Test Coverage**: Include tests for directory normalization, duplicate detection, and empty input validation

## User Feedback Applied

During implementation, user requested:

1. Using Jest built-in mocks (`jest.fn()`) instead of custom `MockPromptService` class to enable call assertions
2. Following test-file-resources spec strictly - use `expectFileMatches()` for all content assertions instead of inline `.toContain()` checks
