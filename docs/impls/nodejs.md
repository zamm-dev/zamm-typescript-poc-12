# NodeJS Implementation of ZAMM

This is an implementation of the ZAMM CLI using NodeJS with TypeScript.

## Project Structure

```
src/
├── __tests__/          # Jest test files
├── cli.ts             # Main CLI entry point with Commander.js
└── index.ts           # Library exports
```

## Commands

- **Format**: `npm run format` - Format code with Prettier
- **Lint**: `npm run lint` - Lint code with ESLint
- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Test**: `npm test` - Run Jest tests
- **Run**: `npm start` - Execute the compiled CLI

## Development

- **Dev mode**: `npm run dev` - Build and run in development
- **Type check**: `npm run typecheck` - TypeScript type checking only
- **Watch build**: `npm run build:watch` - Compile with file watching

## Git Hooks

- **Pre-commit**: Automatically runs linting and formatting on staged files
- **Pre-push**: Runs full test suite before push

### Setup on Fresh Clone

After cloning the repository, run:

```bash
npm install
```

The `prepare` script will automatically set up git hooks via Husky.
