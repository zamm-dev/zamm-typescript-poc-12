# Implement the latest spec changes

This command follows an 8-step process for implementing specifications. Use the TodoWrite tool to track progress through these steps.

## Core Implementation Steps

1. **Project Analysis**: Run `eza . --tree --git-ignore` to understand the entire project structure
2. **Spec Analysis**: Run `git diff main` to understand the latest requested spec changes and implementation requirements
3. **Implementation**: Implement the specification following development best practices (see guidelines below)
4. **Code Commit**: ALWAYS commit the implementation code changes at the end. You may even commit multiple times if there are natural checkpoints to do so at during development.

## User Collaboration Guidelines

- Ask for clarification on underspecified requirements

Keep in mind @.claude/software-dev-guidelines.md
