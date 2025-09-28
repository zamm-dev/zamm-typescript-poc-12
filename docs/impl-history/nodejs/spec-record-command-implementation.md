---
id: RVE111
type: ref-impl
specs:
  - id: FKK364
    path: /spec-history/feature-spec-record-command.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 5692c3ad21e46795296c975511662b43099ced2b
    message: Implement spec record command for tracking spec-history commits
---

# Spec Record Command Implementation

## Implementation Summary

Successfully implemented the `spec record` command that records commit hashes and messages to spec files in the `docs/spec-history/` directory, matching the pattern of the existing `impl record` command.

## Key Implementation Decisions

### 1. Code Reuse Through Shared Utilities

**Decision**: Extract shared commit recording logic into a reusable `commit-recorder.ts` module.

**Rationale**: Both `impl record` and `spec record` commands had nearly identical logic (~40 lines of duplication) for git validation, file parsing, commit retrieval, and frontmatter updating. The only difference was file validation logic.

**Implementation**: Created `recordCommitsToFile` function with dependency injection pattern using a `validateFile` callback, eliminating ~30 lines of duplication per command.

### 2. Consistent Error Messaging

**Decision**: Extract file type utilities into shared `file-types.ts` module.

**Rationale**: Error messages needed to be consistent between commands and follow the same format patterns.

**Implementation**: Shared `getFileTypeLabel` and `getFileTypeDescription` functions used by both commands.

### 3. Test Structure Using Before/After Fixtures

**Decision**: Use clear before/after directory structure for test fixtures instead of inline file creation.

**Rationale**: Makes test expectations explicit and avoids `fs.writeFileSync` in tests which was against project guidelines.

**Implementation**:

- `fixtures/spec/before/` - initial state files
- `fixtures/spec/after/` - expected output after recording commits
- `fixtures/spec/before-with-existing-commits/` - files with existing commits
- `fixtures/spec/after-with-existing-commits/` - expected output when prepending

## Surprises and Gotchas

### 1. Jest Test Discovery Issue

**Problem**: Jest was trying to run the new `spec.ts` command file as a test because of the pattern `**/?(*.)+(spec|test).ts`.

**Solution**: Added `testPathIgnorePatterns` to Jest config to exclude `src/core/` and `src/scripts/` directories.

**Warning**: When adding new command files, ensure they don't match Jest's test patterns or update the ignore patterns accordingly.

### 2. Fixture Path Resolution in Tests

**Problem**: When creating a separate test environment for the "non-git" test, the `originalCwd` was pointing to the temp directory instead of the project directory, causing fixture resolution failures.

**Solution**: Manually fix the `originalCwd` in the test environment to point back to the project directory.

**Warning**: Be careful when creating separate test environments - fixture resolution depends on correct `originalCwd` setup.

### 3. Trailing Newline Consistency

**Problem**: Test failures due to missing trailing newlines in fixture files compared to actual output.

**Solution**: Ensure all fixture files have consistent trailing newlines matching the actual serialization output.

## Testing Strategy

- **Comprehensive Coverage**: 9 test cases covering success paths, error conditions, and edge cases
- **Exact File Matching**: Uses `expectFileMatches` against fixture files rather than partial string matching
- **Isolated Environments**: Each test runs in a clean temporary git repository
- **Deterministic Commits**: Uses `createDeterministicCommits` for predictable commit hashes in tests

## Architecture Notes

The implementation follows the established patterns in the codebase:

- Commands in `src/core/commands/`
- Shared utilities in `src/core/shared/`
- CLI integration in `zamm.ts`
- Comprehensive test suites in `src/__tests__/commands/`
- Test fixtures organized by command and scenario
