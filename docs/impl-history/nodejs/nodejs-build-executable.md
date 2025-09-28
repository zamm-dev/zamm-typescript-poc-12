---
id: BEX429
type: ref-impl
specs:
  - id: HPF761
    path: /specs/project-setup.md
impl:
  id: IEU463
  path: /impls/nodejs.md
references:
  - id: LVH754
    path: nodejs-project-init.md
commits:
  - sha: 32fe8a94a8bc228b0acc630aee285582215ad94c
    message: Update build process to create proper executable file
---

# Node.js Build Executable Implementation

## Overview

Update the Node.js build process to output an executable `dist/zamm` file that can be invoked from the command line, following the pattern used by standard Node.js CLI tools like tsc, eslint, and jest.

## Background

The project-setup.md specification was updated to clarify that the build command should package the code so that `zamm` can be invoked from the commandline. For Node.js projects, this means creating a proper executable with a shebang that can be run directly.

## Implementation Plan

### 1. File Structure Changes

- Rename `src/cli.ts` to `src/zamm.ts` to match the executable name
- Update all references to cli.ts in test files

### 2. Build Configuration

Update the TypeScript build to:

- Compile `src/zamm.ts` to `dist/zamm` (without .js extension)
- Preserve the shebang line (`#!/usr/bin/env node`)
- Make the output file executable

### 3. Package.json Updates

```json
{
  "bin": {
    "zamm": "dist/zamm"
  },
  "scripts": {
    "start": "node dist/zamm",
    "postbuild": "chmod +x dist/zamm"
  }
}
```

### 4. Git Hooks Update

Update `.husky/pre-commit` to include the build step as required by the specification:

```bash
npx lint-staged && npm run build
```

### 5. Expected Outcome

After running `npm run build`:

- `dist/zamm` exists as an executable file
- `./dist/zamm` can be run directly from the command line
- `npm link` would install it globally as `zamm`
- The pattern matches other Node.js CLI tools

## Implementation Results

### Successful Implementation

All planned changes were successfully implemented:

1. **File Rename**: `src/cli.ts` renamed to `src/zamm.ts`
   - No test files needed updating as they don't directly reference cli.ts

2. **Build Process**: Modified to output `dist/zamm` as an executable
   - TypeScript compiles to `dist/zamm.js`
   - Build script moves `zamm.js` to `zamm` (removing .js extension)
   - Post-build script makes it executable with `chmod +x`

3. **Package.json Updates**:
   - `bin` field updated to point to `dist/zamm`
   - `build` script: `tsc && mv dist/zamm.js dist/zamm`
   - `postbuild` script: `chmod +x dist/zamm`
   - `start` script updated to run `node dist/zamm`

4. **Git Hooks**: Pre-commit hook now runs build step
   - Updated from `npx lint-staged` to `npx lint-staged && npm run build`
   - Ensures the executable is always built before commits

### Verification

- `npm run build` successfully creates `dist/zamm` as an executable file
- `./dist/zamm --version` returns `1.0.0`
- `./dist/zamm info JHI842` correctly displays project information
- All tests pass with `npm test` (28 passing tests)
- Pre-commit hook executes build step successfully

The implementation follows the same pattern as other Node.js CLI tools, making it ready for distribution and global installation via `npm link`.
