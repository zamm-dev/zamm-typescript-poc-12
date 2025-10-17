---
id: TNT183
type: ref-impl
specs:
  - id: NNX021
    path: /spec-history/include-project-setup.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: 687c025a457a29bf3cbf0f458806fced0bb777d5
    message: Include project-setup.md in init project command
---

# Implementation Notes

## Overview

Successfully implemented support for including `project-setup.md` in newly initialized ZAMM projects. The file is now automatically copied from the ZAMM resource bundle to `docs/project-setup.md` when running `zamm init project`.

## Implementation Approach

### Resource Bundling

- Updated `src/scripts/refresh-init-scripts.ts` to copy `docs/specs/project-setup.md` to `src/resources/project-setup.md` during the resource refresh process
- This ensures the file is included when the project is built and packaged

### Project Initialization

- Added a module-level constant `PROJECT_SETUP_RESOURCE` in `src/core/commands/init-project.ts` pointing to the bundled resource
- Used the simple pattern matching `init.ts` (following existing conventions rather than complex path resolution)
- Added `fs.copyFileSync()` call to copy the resource to `docs/project-setup.md` in the newly created project
- Updated the success message to include `docs/project-setup.md` in the list of created files

### Test Fixtures

- Added `project-setup.md` to both test fixture directories to verify the file is created correctly during project initialization

## Key Design Decisions

1. **Simple resource resolution**: Used a straightforward `path.resolve(__dirname, '../../resources/project-setup.md')` pattern rather than implementing complex fallback logic, matching the existing codebase patterns in `init.ts`

2. **Resource bundling approach**: Leveraged the existing `refresh-init-scripts.ts` script to copy the spec file as a resource, maintaining consistency with how other initialization resources are bundled

## Testing

All tests pass, including:

- Project initialization with interactive prompts
- Project initialization with command options
- Project directory name normalization
- Error handling for existing directories and empty inputs

The implementation correctly creates `docs/project-setup.md` in initialized projects as verified by the test fixtures.
