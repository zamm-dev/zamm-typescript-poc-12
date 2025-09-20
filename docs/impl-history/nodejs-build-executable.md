---
id: BEX429
type: implementation-note
specs:
  - id: HPF761
    path: ../project-setup.md
references:
  - id: IEU463
    path: ../impls/nodejs.md
  - id: LVH754
    path: nodejs-project-init.md
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

[To be updated after implementation]
