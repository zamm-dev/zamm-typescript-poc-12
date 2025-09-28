---
id: GDO015
type: ref-impl
specs:
  - id: GBG455
    path: /spec-history/add-redirect-command.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: b7e707faae8c9b59d3b073188f81145beba23917
    message: Fix symlink path resolution issues in tests
  - sha: 63860af640d4c78da69ac3aa0d3cf96f9fba7e0a
    message: Fix Jest worker crashes and async issues across all test suites
  - sha: aa0ccc0f791a3660a3b5eabdab6345b38dac5dfd
    message: Fix symlink path resolution in implement.test.ts
  - sha: 839842e3779246a7000622c64bf81a8c8f28752d
    message: Implement redirect command for custom base directory
---

# NodeJS Implementation of CLI Redirect Command

## Implementation Overview

The redirect command was successfully implemented to allow users to set a custom base directory for ZAMM's docs directory discovery. This enables ZAMM to work with projects that have non-standard directory structures or want to point to docs stored in a different location.

## Key Implementation Details

### Core Components Added

1. **`src/core/commands/redirect.ts`** - Main command implementation
   - `setRedirect()` function to set custom docs directory
   - Integration with existing `getDocsDirectory()` workflow
   - Validation for directory existence and accessibility

2. **Base State Management**
   - Enhanced `.zamm/base-state.json` structure to include `redirectDocsTo` field
   - Maintains compatibility with existing worktree tracking functionality

3. **CLI Integration**
   - Added `redirect set` subcommand to `src/zamm.ts`
   - Follows existing CLI patterns with proper error handling

### Critical Implementation Challenges

#### 1. Test Infrastructure Issues - **Major Issue**

The most significant challenge was fixing Jest worker crashes across the entire test suite. The redirect implementation itself was straightforward, but it exposed existing async/await issues in test suites:

- **Root Cause**: Many test functions were not properly awaiting async operations
- **Impact**: Jest workers would crash with "Cannot read properties of undefined" errors
- **Solution**: Systematically converted all test functions to async/await pattern
- **Files Affected**: All test suites in `src/__tests__/commands/`

#### 2. macOS Symlink Path Resolution - **Critical Issue**

On macOS, temp directories use symlinks that caused path calculation failures:

- **Root Cause**: `/var` is symlinked to `/private/var`, causing `path.relative()` to generate incorrect relative paths
- **Symptom**: Test failures with paths like `../../../../../../../var/folders/...`
- **Solution**: Added `fs.realpathSync()` to resolve symlinks in `src/core/shared/file-resolver.ts`
- **Key Change**: Line 104-105 in `file-resolver.ts` now resolves `process.cwd()` before path calculations

#### 3. Working Directory Management in Tests

- **Issue**: Tests needed to run within temp directories for proper path resolution
- **Solution**: Enhanced all test suites with `process.chdir(testEnv.tempDir)` in `beforeEach()`
- **Critical**: This pattern must be maintained in all future command tests

### Architecture Decisions

#### 1. State Storage Strategy

- **Decision**: Store redirect configuration in `.zamm/base-state.json` at git root
- **Rationale**: Centralizes all base directory state management
- **Alternative Considered**: Separate `.zamm/redirect.json` file (rejected automatically without ever having been presented to user)

#### 2. Integration Approach

- **Decision**: Enhance existing `getDocsDirectory()` function rather than replace it
- **Rationale**: Maintains backward compatibility and existing error handling patterns
- **Key Benefit**: Zero impact on existing commands

#### 3. Path Storage Format

- **Decision**: Store absolute paths in `.zamm/base-state.json`
- **Rationale**: Avoids relative path resolution issues across different working directories
- **Security**: Paths are validated for existence and accessibility on each use

## Testing Strategy Lessons

### Test File Organization

- **Pattern Used**: Following test-file-resources spec with exact fixture matching
- **Key Learning**: Avoid `expect().toContain()` for file content verification
- **Best Practice**: Use `expectFileMatches()` for all file content assertions

### Path Handling in Tests

- **Critical**: All tests must account for macOS symlink resolution
- **Pattern**: Use `fs.realpathSync()` for any path comparisons in assertions
- **Debugging**: Add temporary `console.log()` statements to verify actual vs expected paths

## Future Implementation Guidance

### For Future Maintainers

1. **Always test on macOS** - Symlink issues are platform-specific and will not appear on Linux
2. **Use async/await consistently** - Jest worker crashes are hard to debug; prevention is key
3. **Working directory management** - All command tests must call `process.chdir(testEnv.tempDir)`
4. **Path calculations** - Always use `fs.realpathSync()` for cross-platform compatibility

## Performance Notes

- **Minimal overhead**: Redirect lookup adds one file read operation per command execution
- **Caching opportunity**: Could cache redirect state in memory for long-running operations
- **Validation frequency**: Directory accessibility is checked on every command; could be optimized

## Error Handling Patterns

- **Validation timing**: Directory validation occurs at both set-time and use-time
- **Graceful degradation**: If redirect directory becomes inaccessible, clear error messages guide user
