---
id: LVH754
type: ref-impl
specs:
  - id: HPF761
    path: /specs/project-setup.md
impl:
  id: IEU463
  path: /impls/nodejs.md
commits:
  - sha: e01be6ede9f0b95c5d15333eac9cda2e5f6d85b4
    message: Set up Node.js project with TypeScript, ESLint, Prettier, Jest, and Husky
---

# Node.js Project Setup Plan for ZAMM

This document outlines a comprehensive plan for setting up the Node.js implementation of ZAMM according to the project requirements in `docs/project-setup.md`.

## Overview

ZAMM is a literate programming tool that tracks relationships between human requirements and machine code. This Node.js implementation will be set up as a CLI tool with modern tooling and best practices for 2024/2025.

## 1. Core Dependencies and Tools

### Development Dependencies

- **TypeScript**: For type safety and better developer experience
- **ESLint**: Code linting with modern configurations
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **ts-node**: TypeScript execution for development
- **tsx**: Fast TypeScript execution (alternative to ts-node)
- **husky**: Git hooks management
- **lint-staged**: Run linters on staged files only

### Runtime Dependencies

- **commander**: CLI argument parsing
- **chalk**: Terminal styling (if needed for output)
- **fs-extra**: Enhanced file system operations

### Build Tools

- **esbuild** or **tsup**: Fast TypeScript bundling for production builds
- **@types/node**: Node.js type definitions

## 2. Package.json Script Configuration

The following npm scripts will satisfy all project requirements:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,js,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,js,json,md}\"",
    "lint": "eslint src --ext .ts,.js --fix",
    "lint:check": "eslint src --ext .ts,.js",
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "build:watch": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "prepare": "husky install",
    "prepack": "npm run build"
  }
}
```

## 3. Git Hook Setup with Husky

### Installation and Configuration

1. Install husky and lint-staged
2. Run `npx husky install` to set up hooks directory
3. Create pre-commit and pre-push hooks

### Lint-staged Configuration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 4. File Structure

```
zamm-typescript-poc-12/
├── src/
│   ├── commands/           # CLI command implementations
│   ├── lib/               # Core library code
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── tests/
│   ├── __mocks__/         # Jest mocks
│   ├── fixtures/          # Test data
│   └── **/*.test.ts       # Test files
├── dist/                  # Built output (gitignored)
├── docs/                  # Documentation (existing)
├── .husky/                # Git hooks
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
├── .gitignore
└── README.md
```

## 5. Configuration Files

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  },
};
```

### Prettier Configuration (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

## 6. Step-by-Step Implementation Order

### Phase 1: Project Initialization

1. Initialize npm project: `npm init -y`
2. Install TypeScript and basic dependencies
3. Set up basic TypeScript configuration
4. Create initial file structure

### Phase 2: Development Tooling

1. Configure ESLint with TypeScript support
2. Configure Prettier
3. Set up Jest for testing
4. Configure build system (tsup/esbuild)

### Phase 3: Git Hooks and Automation

1. Install and configure husky
2. Set up lint-staged
3. Create pre-commit hook (lint + format + build)
4. Create pre-push hook (tests)
5. Test hook functionality

### Phase 4: CLI Foundation

1. Set up commander.js for CLI parsing
2. Create basic CLI structure
3. Implement basic commands
4. Add comprehensive tests

### Phase 5: Documentation and Build System

1. Update package.json scripts
2. Document all commands in README or Justfile
3. Verify all requirements are met
4. Create build and release workflows

## 7. CLI Tool Specific Considerations

### Binary Setup

- Configure `bin` field in package.json to make CLI globally installable
- Add shebang to main entry file for Unix systems
- Consider cross-platform compatibility

### Error Handling

- Implement graceful error handling for CLI operations
- Provide helpful error messages and usage information
- Exit with appropriate status codes

### Configuration

- Support configuration files (JSON, YAML, or JS)
- Allow CLI arguments to override configuration
- Provide sensible defaults

### Testing Strategy

- Unit tests for core logic
- Integration tests for CLI commands
- Mock file system operations appropriately
- Test error conditions and edge cases

## 8. Command Documentation

All commands will be documented in the package.json scripts section and can be run as follows:

- **Format code**: `npm run format`
- **Lint code**: `npm run lint`
- **Build code**: `npm run build`
- **Run tests**: `npm test`
- **Run the code**: `npm start` (production) or `npm run dev` (development)

These commands satisfy all requirements from `docs/project-setup.md`.

## 9. Modern Node.js Best Practices (2024/2025)

- Use TypeScript for type safety and better IDE support
- Employ modern ES modules where possible
- Use `tsx` for fast TypeScript execution in development
- Implement proper error handling with custom error classes
- Use `tsup` for fast, zero-config bundling
- Configure strict TypeScript settings for better code quality
- Use `lint-staged` to only lint changed files for faster CI/CD
- Implement comprehensive testing with good coverage
- Use modern Node.js APIs (avoiding deprecated functions)
- Consider using `node:` protocol for built-in modules

## 10. Implementation Results and Issues Encountered

### ESLint Configuration Challenges

During implementation, encountered issues with ESLint v9.35.0 flat config format:

**Issue**: Initial attempt used ES module import syntax in eslint.config.js:

```javascript
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
// ...
export default [
```

**Error encountered**:

```
SyntaxError: Cannot use import statement outside a module
```

**Root cause**: Package.json was configured with `"type": "commonjs"`, but ESLint v9 flat config examples typically use ES modules.

**Solution implemented**: Converted eslint.config.js to use CommonJS syntax:

```javascript
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
// ...
module.exports = [
```

**Actual configuration used**:

- ESLint v9.35.0 with flat config format
- CommonJS syntax for configuration file
- TypeScript support via @typescript-eslint plugins
- Prettier integration for formatting rules
- Custom rules for CLI tool needs (console.log allowed)

### Installation Results

**Dependencies successfully installed**:

```
npm install --save-dev typescript @types/node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier jest @types/jest ts-jest @eslint/js husky lint-staged

npm install commander chalk
```

**Versions installed**:

- TypeScript: ^5.9.2
- ESLint: ^9.35.0
- Prettier: ^3.6.2
- Jest: ^30.1.3
- Husky: ^9.1.7
- Commander: ^14.0.1
- Chalk: ^5.6.2

### Configuration Files Created

✅ **tsconfig.json**: Strict TypeScript configuration with ES2022 target
✅ **eslint.config.js**: ESLint v9 flat config with TypeScript support
✅ **.prettierrc**: Standard Prettier configuration with single quotes
✅ **.prettierignore**: Ignoring build artifacts and dependencies
✅ **jest.config.js**: Jest configuration with ts-jest preset
✅ **package.json**: Updated with all required npm scripts and dependencies

### Git Hooks Configuration

✅ **Husky initialized**: `npx husky init` created .husky directory
✅ **Pre-commit hook**: Configured to run `npx lint-staged`
✅ **Pre-push hook**: Configured to run `npm test`

**Note**: Pre-push hook executable permissions need to be set manually after creation.

### Project Structure Created

✅ **Source directory**: Created `src/` with CLI entry point
✅ **CLI implementation**: `src/cli.ts` with Commander.js setup and shebang
✅ **Main export**: `src/index.ts` for library exports
✅ **Test structure**: `src/__tests__/cli.test.ts` with Jest test example
✅ **.gitignore**: Comprehensive Node.js gitignore for build artifacts and dependencies

### Lint-staged Configuration

✅ **Added to package.json**:

```json
"lint-staged": {
  "*.{ts,js}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

### Final Project Structure

```
zamm-typescript-poc-12/
├── .husky/
│   ├── pre-commit        # Runs lint-staged
│   └── pre-push          # Runs npm test
├── src/
│   ├── __tests__/
│   │   └── cli.test.ts   # Basic test structure
│   ├── cli.ts            # Main CLI entry point with Commander.js
│   └── index.ts          # Library exports
├── docs/                 # Existing documentation
├── node_modules/         # Dependencies (gitignored)
├── .eslintrc.js         # ESLint v9 flat config (CommonJS)
├── .gitignore           # Comprehensive Node.js gitignore
├── .prettierrc          # Prettier configuration
├── .prettierignore      # Prettier ignore patterns
├── jest.config.js       # Jest testing configuration
├── package.json         # Complete with all scripts and dependencies
└── tsconfig.json        # Strict TypeScript configuration
```

### Verification Commands

All required project-setup.md commands are now available:

- **Format**: `npm run format` ✅
- **Lint**: `npm run lint` ✅
- **Build**: `npm run build` ✅
- **Test**: `npm test` ✅
- **Run**: `npm start` ✅

Additional development commands:

- `npm run dev` - Development mode
- `npm run typecheck` - Type checking only
- `npm run format:check` - Check formatting without writing
- `npm run lint:fix` - Lint with auto-fix

## 11. Success Criteria

The setup will be considered complete when:

- All required commands work as expected
- Git hooks properly run linting, formatting, building, and testing
- The CLI tool can be built and executed
- All code passes linting and formatting checks
- Test suite runs successfully with good coverage
- Documentation is complete and accurate
- Project can be easily understood and extended by new developers
