---
id: YKA284
type: ref-impl
specs:
  - id: GBG455
    path: /spec-history/add-redirect-command.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: abaac12424fd7074404b442d4310466a3aeb180d
    message: >-
      Refactor: Separate redirect configuration into dedicated
      .zamm/redirect.json file
---

# Refactor: Separate Redirect Configuration into Dedicated File

## Implementation Overview

This refactor separates redirect configuration storage from the workflow state management by moving redirect information from `.zamm/base-state.json` to a dedicated `.zamm/redirect.json` file.

## Key Changes Made

### 1. Created New RedirectService (`src/core/shared/redirect-service.ts`)

- **Purpose**: Dedicated service for managing redirect configuration independently from workflow state
- **Methods**:
  - `setRedirectDirectory()`: Validates and stores redirect configuration
  - `getRedirectDirectory()`: Retrieves redirect configuration
- **File Format**: Creates `.zamm/redirect.json` with simple `{ "directory": "path" }` structure

### 2. Updated BaseWorkflowService (`src/core/shared/workflow-service.ts`)

- **Removed**: All redirect-related methods (`setRedirectDirectory`, `getRedirectDirectory`)
- **Reason**: Separation of concerns - workflow service now focuses solely on workflow state management
- **Impact**: `base-state.json` no longer contains `redirectDirectory` field

### 3. Updated File Utilities (`src/core/shared/file-utils.ts`)

- **Changed**: `getDocsDirectory()` now uses `RedirectService` instead of `BaseWorkflowService`
- **Behavior**: Identical functionality, different service dependency

### 4. Updated Redirect Command (`src/core/commands/redirect.ts`)

- **Changed**: Now uses `RedirectService.setRedirectDirectory()` directly
- **Behavior**: Same user-facing functionality

### 5. Updated Type Definitions (`src/core/shared/types.ts`)

- **Added**: `RedirectConfig` interface for redirect file structure
- **Removed**: `redirectDirectory` field from `BaseState` interface

## Implementation Challenges & Solutions

### Challenge: Maintaining Backward Compatibility

**Issue**: Existing `.zamm/base-state.json` files in the wild may still contain `redirectDirectory` field.

**Solution**: The new implementation gracefully ignores old redirect data in `base-state.json`. Users with existing redirects will need to re-run the redirect command, but this is acceptable for this refactor.

### Challenge: Test Coverage

**Issue**: All existing tests expected redirect data in `base-state.json`.

**Solution**: Updated all test assertions to expect and verify the new `.zamm/redirect.json` file structure. Tests now verify:

- Separate file creation
- Independence from workflow state
- Proper file structure

### Challenge: Service Dependencies

**Issue**: Multiple services needed to import the redirect functionality.

**Solution**: Created clean separation by exporting `RedirectService` from core module and updating all consumers to use the appropriate service.

## Critical Implementation Notes

### File System Structure

The refactor creates this new file structure:

```
.zamm/
├── base-state.json      # Workflow state only (no redirect data)
├── redirect.json        # Redirect configuration only
└── .gitignore          # Ignores all .zamm contents
```

### Testing Considerations

- All redirect tests now verify `.zamm/redirect.json` instead of `base-state.json`
- Tests verify that base-state.json is NOT affected by redirect operations
- Integration tests confirm that other commands still work with redirected directories

### Error Handling

The refactor maintains all existing error handling patterns:

- Directory validation at set time
- Runtime validation when accessing redirect directory
- Clear error messages for missing or inaccessible directories

## Future Implementation Guidance

### For Future Maintainers

1. **Separation of Concerns**: Keep redirect configuration separate from workflow state management
2. **Service Pattern**: Use dedicated services for distinct functionality areas
3. **Test Independence**: Ensure tests verify the specific file being modified
4. **Error Messages**: Maintain clear, actionable error messages for directory issues
