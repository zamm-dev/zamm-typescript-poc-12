---
id: TCN856
type: spec
---

# `init project`

The `zamm init project` command sets up a new ZAMM project with the expected directory structure for literate programming and multi-implementation support. This command is designed for starting fresh projects and establishing the foundational documentation structure following the Git worktree layout described in the [Development Scripts](../../dev-scripts.md) specification.

## Interactive Terminal I/O

The command uses interactive prompts to gather information from the user:

1. **Project title prompt**: Ask the user "What is the project title?" and collect the title that will be used as the level-1 heading in `docs/README.md`.
2. **Project description prompt**: Ask the user "What is this project about?" and collect a multi-line or single-line response describing the project's purpose and goals.
3. **Initial stack prompt**: Ask the user "What is the initial stack/implementation?" and collect the response describing the technology stack (e.g., "NodeJS with TypeScript", "Python with FastAPI", "Rust").

## Generated Structure

The command creates the following structure:

```
<project-name>/
└── base/
    ├── .git/
    └── docs/
        ├── README.md
        ├── project-setup.md
        └── impls/
            └── <stack-name>.md
```

The outer `<project-name>/` directory is the project meta folder that will contain the `base/` branch and future worktrees as sibling directories. The Git repository is initialized inside the `base/` directory.

### `docs/README.md`

The main project documentation file must include:

- YAML frontmatter with:
  - A unique auto-generated ID
  - `type: project`
- A level-1 heading with the title provided by the user
- The project description content provided by the user

**Example output:**

```markdown
---
id: ABC123
type: project
---

# Task Management Application

A web-based task management application that helps teams collaborate on projects and track their progress in real-time.
```

### `docs/project-setup.md`

The project setup documentation file is a copy of the ZAMM project setup specification. This file is bundled with the ZAMM CLI and copied as-is to provide a consistent [developer experience](https://en.wikipedia.org/wiki/Developer_Experience) to newly setup projects, including:

- Standardized and documented commands for formatting, linting, building, testing, and running the code
- Git repo setup, including commit hooks and a stack-specific ignore file
- Verification of successful setup

Developers can and should customize this file for their specific implementation and tech stack.

### `docs/impls/<stack-name>.md`

The implementation documentation file must include:

- YAML frontmatter with:
  - A unique auto-generated ID (different from the project README ID)
  - `type: implementation`
- A level-1 heading in the format: "<Stack Name> Implementation of <Project Name>"
- The stack specification content provided by the user

**Example output for `docs/impls/nodejs.md`:**

```markdown
---
id: XYZ789
type: implementation
---

# NodeJS Implementation of Task Management Application

This is an implementation of the Task Management Application using NodeJS with TypeScript.
```

The implementation filename should:

- Be derived from the stack name
- Use lowercase with hyphens for multi-word names (e.g., "Ruby on Rails" → `ruby-on-rails.md`)
- Use the `.md` extension

## Directory Creation and Initialization

The command creates the project meta folder structure:

1. Create the project meta folder `<project-name>/` in the current working directory
   - The project name should be derived from the project title by converting it to lowercase and replacing spaces with hyphens (e.g., "Task Management Application" → `task-management-application/`)
2. Create the `base/` subdirectory inside the project meta folder
3. Initialize a Git repository inside `base/` using `git init`
4. Create the `base/docs/` directory
5. Create the `base/docs/impls/` directory
6. Create the `docs/README.md` and `docs/impls/<stack-name>.md` files with proper frontmatter and content
7. Copy `docs/project-setup.md` from the ZAMM resource bundle to `base/docs/project-setup.md`
8. Make an initial Git commit with all the generated files and the commit message "Initial project setup"

## Error Handling

- If the project meta folder already exists in the current directory, fail with a clear message to prevent overwriting existing projects
- If the user provides empty responses to prompts, re-prompt them or provide a helpful error message
- If file system operations fail (permission errors, disk full, etc.), surface the error clearly

## Success Message

Upon successful completion, print a confirmation message showing:

- The project meta folder that was created
- The path to the created `docs/README.md` (relative to the base directory)
- The path to the created implementation file (relative to the base directory)
- Instructions to navigate into the base directory
- A suggestion to run `zamm init scripts --impl <impl-file>` to set up the project's workflow assets

**Example:**

```
Project initialized successfully!

Created:
  task-management-application/base/docs/README.md
  task-management-application/base/docs/impls/nodejs.md

Next steps:
  cd task-management-application/base
  zamm init scripts --impl docs/impls/nodejs.md
```

## Project Start Workflow

After running `zamm init project`, users should typically follow up with:

1. Navigate to the base directory: `cd <project-name>/base`
2. Set up workflow assets: `zamm init scripts --impl docs/impls/<stack-name>.md`
3. Begin their first feature: `zamm feat start <feature-description>`

The command should not automatically run these follow-up steps, but the success message should guide users on the typical next actions.
