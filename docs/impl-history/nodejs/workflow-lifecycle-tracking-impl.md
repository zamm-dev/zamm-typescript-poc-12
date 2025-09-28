---
id: OCD501
type: ref-impl
specs:
  - id: GQB162
    path: /spec-history/feat-state-tracking.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 9991bcf61bf9dce9a933885b82f4162574dd7e89
    message: Implement ZAMM workflow lifecycle tracking with separated services
---

# ZAMM Workflow Lifecycle Tracking Implementation

## Implementation Summary

Implemented ZAMM workflow lifecycle tracking with separated services for base directory and worktree management, enabling proper state tracking through the Git worktree workflow.

## Architecture Decisions

### Service Separation

- **BaseWorkflowService**: Manages `.zamm/` state in the base repository directory
- **WorktreeWorkflowService**: Manages `.zamm/` state in individual worktree directories
- **Abstract WorkflowService**: Provides shared functionality for directory setup and `.gitignore` management

This separation makes it clear which operations should be performed in which context and prevents confusion about where state should be managed.

### State Management

- **Base Directory**: Tracks all worktrees in `base-state.json` with branch names, paths, and states
- **Worktree Directory**: Tracks current workflow state in `current-workflow-state.json`
- **Git Ignored**: All `.zamm/` contents are ignored via `.zamm/.gitignore` containing `*\n`

## Implementation Challenges

### Test Fixture Management

**Challenge**: Test fixtures for `.zamm/` files were being ignored by Git due to the `.gitignore` files within the fixture directories.

**Solution**: Used `git add -f` to force-add test fixture files, including:

- `src/__tests__/fixtures/feat/.zamm/.gitignore`
- `src/__tests__/fixtures/feat/.zamm/base-state.json`
- `src/__tests__/fixtures/feat/worktree/.zamm/.gitignore`
- `src/__tests__/fixtures/feat/worktree/.zamm/current-workflow-state.json`

### Dynamic Path Testing

**Challenge**: The `base-state.json` file contains dynamic worktree paths that change between test runs.

**Solution**: Enhanced `expectFileMatches` test utility with string replacement functionality:

```typescript
expectFileMatches(testEnv, '.zamm/base-state.json', undefined, {
  [fs.realpathSync(worktreePath)]: '/path/to/worktree',
});
```

### Path Resolution on macOS

**Challenge**: macOS symlink resolution differences between `/var` and `/private/var` caused test failures.

**Solution**: Used `fs.realpathSync()` consistently when storing and comparing paths to ensure consistent resolution.

### TypeScript/ESLint Issues

**Challenge**: JSON parsing and error handling triggered TypeScript strict mode warnings.

**Solution**: Used proper type assertions (`as BaseState`) and structured error handling with type guards.

## Code Changes

### Core Implementation

1. **types.ts**: Added `WorkflowState`, `WorktreeInfo`, `BaseState`, and `CurrentWorkflowState` interfaces
2. **workflow-service.ts**: Created separated service classes with clear responsibilities
3. **feat.ts**: Updated to use appropriate services for base vs worktree operations
4. **index.ts**: Exported new workflow services

### Testing Enhancements

1. **test-utils.ts**: Enhanced `expectFileMatches` with string replacement support
2. **feat.test.ts**: Added comprehensive validation for all `.zamm/` file structures
3. **fixtures/**: Added test fixtures for both base and worktree `.zamm/` directories

## Future Implementation Guidance

### Key Considerations

1. **Always use the correct service**: Use `BaseWorkflowService` for base directory operations and `WorktreeWorkflowService` for worktree operations
2. **Path resolution**: Use `fs.realpathSync()` when storing paths to ensure consistency across different environments
3. **Test fixtures**: Remember to force-add any test fixtures that might be ignored by `.gitignore` files

### Potential Extensions

1. **State transitions**: Add validation for valid workflow state transitions
2. **Cleanup**: Add functionality to remove completed worktrees from base state
3. **CLI commands**: Add commands to query and update workflow states manually

## Dependencies

- No new runtime dependencies added
- Enhanced existing test utilities rather than adding new testing frameworks
