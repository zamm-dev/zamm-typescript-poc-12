---
id: IEU463
type: implementation
---

# NodeJS Implementation of ZAMM

This is an implementation of the ZAMM CLI using NodeJS with TypeScript.

## Project Structure

```
src/
├── __tests__/            # Jest test files
│   ├── fixtures/         # Test fixture files with preserved directory structure
│   │   ├── info/         # Info command test fixtures
│   │   │   └── docs/     # Realistic file hierarchy for info tests
│   │   │       ├── features/
│   │   │       │   └── impl-history/  # Implementation note fixtures
│   │   │       └── impls/
│   │   └── organize/     # Organize command test fixtures
│   │       ├── before/   # Before-state directory structures
│   │       │   └── docs/
│   │       └── after/    # After-state directory structures
│   │           └── docs/
│   ├── organize.test.ts  # Organize command tests
│   ├── info.test.ts      # Info command tests
│   ├── implement.test.ts # Implement command tests
│   └── test-utils.ts     # Shared test utilities with directory copying
├── zamm.ts               # Main CLI entry point with Commander.js
├── core.ts               # Core organize, info, and implement command logic
└── index.ts              # Library exports
```

## Commands

- **Format**: `npm run format` - Format code with Prettier
- **Lint**: `npm run lint` - Lint code with ESLint
- **Build**: `npm run build` - Compile TypeScript and create executable at `dist/zamm`
- **Test**: `npm test` - Run Jest tests
- **Run**: `npm start` - Execute the compiled CLI (`dist/zamm`)

## CLI Commands

- **organize/o**: Add proper YAML frontmatter to markdown files
- **info**: Display structured information about a file by ID or path
- **implement/i**: Generate implementation note file for a spec and implementation

## Development

- **Dev mode**: `npm run dev` - Build and run in development
- **Type check**: `npm run typecheck` - TypeScript type checking only
- **Watch build**: `npm run build:watch` - Compile with file watching

## Git Hooks

- **Pre-commit**: Automatically runs linting, formatting on staged files, and builds the project
- **Pre-push**: Runs full test suite before push

### Setup on Fresh Clone

After cloning the repository, run:

```bash
npm install
```

The `prepare` script will automatically set up git hooks via Husky.
