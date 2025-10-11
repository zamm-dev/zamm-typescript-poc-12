---
id: HTN249
type: ref-impl
specs:
  - id: CXM869
    path: /spec-history/zamm-impl-filename.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 1d7c1ed97b40ed4ffa8856e9bd976c6f8cc39570
    message: Update implement-spec workflow with optional parameter guidance
  - sha: aaa9c5e02d927b775154b6a4ce5350d1bc6deee2
    message: Add optional --filename argument to impl create command
---

# Implementation: Optional --filename Argument for impl create Command

## Implementation Summary

Added optional `--filename` argument to `zamm impl create` command that allows custom naming of generated reference implementation files instead of the default `new-<spec-id>-impl.md` pattern.

## Changes Made

1. **Type Definition** (`src/core/shared/types.ts`)
   - Added `filename?: string | undefined` to `ImplementOptions` interface
   - Used explicit `| undefined` union to satisfy TypeScript's `exactOptionalPropertyTypes: true` setting

2. **Core Logic** (`src/core/commands/implement.ts`)
   - Added `customFilename` parameter to `getNewImplementationNotePath` function
   - Removed unused `gitRoot` parameter from the same function
   - Updated filename selection: `customFilename || 'new-${specInfo.id}-impl.md'`

3. **CLI Integration** (`src/zamm.ts`)
   - Added `.option('--filename <filename>', 'custom filename for the generated file')` to command definition
   - Updated `implementWithErrorHandling` to pass filename through to core function

4. **Testing** (`src/__tests__/commands/implement.test.ts`)
   - Added test case "should use custom filename when provided"
   - Created fixture file `custom-implementation.md` for validation

## Implementation Notes

### TypeScript `exactOptionalPropertyTypes` Consideration

The project uses `exactOptionalPropertyTypes: true` in TypeScript configuration, which distinguishes between:

- `property?: string` - property can be absent
- `property?: string | undefined` - property can be absent OR explicitly set to undefined

When passing optional parameters through function boundaries, explicitly include `| undefined` in the type to allow direct assignment without conditional checks. This avoids unnecessary defensive code while maintaining type safety.

### Test Pattern

The test reuses existing fixtures from the info command (as specified in the spec) for input files, and only creates new fixtures for expected output validation. This follows the established pattern of minimizing duplicate test resources.
