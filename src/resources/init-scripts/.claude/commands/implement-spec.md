# Implement the latest spec changes

We are going to implement changes to the spec on the project implementation described at @{{IMPL_PATH}} . Use the TodoWrite tool to track progress through the below steps.

## Core Implementation Steps

1. **Spec Analysis**: Run `git diff main` to understand the latest requested spec changes and implementation requirements
2. **Implementation**: Implement the specification following development best practices (see guidelines below). When user provides feedback that requires changes, immediately run `git add` to stage the changes before committing.
3. **Testing**: Run tests before committing. For workflow/script changes, run E2E tests as well. If tests fail, investigate thoroughly - assume all tests were passing before you started. If you are really convinced that the failures are not due to your changes, prove it with `git stash`.
4. **Code Commit**: ALWAYS commit the implementation code changes at the end. You may even commit multiple times if there are natural checkpoints to do so at during development.

## User Collaboration Guidelines

- Ask for clarification on underspecified requirements

Keep in mind @.claude/software-dev-guidelines.md
