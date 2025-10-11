---
id: LKJ392
type: spec
---

# Claude Workflow Commands

This specification describes the Claude Code workflow command files stored in `.claude/commands/` that guide LLM agents through common development workflows for this project.

## Overview

Claude Code workflow commands are markdown files stored in `.claude/commands/` that provide structured prompts for common development tasks. These commands are invoked using slash commands (e.g., `/implement-spec`, `/change-spec`) and provide step-by-step guidance to LLM agents.

## Core Development Workflow

The ZAMM development workflow is based on the following cycle:

1. The user generates a new changelog entry. Only files in `spec-history/` should be modified.
2. Claude is asked to `/change-spec` - Update existing specifications/documentation based on user-requested changelog in `spec-history/`. Only files in `specs/` should be modified.
3. Claude is asked to `/implement-spec` - Implement all the changes to the spec. Only the actual code code and files in `impls/` should be modified.
4. Claude is asked to `/document-impl` - Document how the implementation was done for future reference. Only files in `impl-history/` should be modified.

After every Claude command, the command `/recursive-self-improvement` may be run to update Claude instruction files for better user collaboration in the future.

## Workflow File Structure

Each workflow command file should:

- Provide a clear title describing the workflow's purpose
- List numbered steps in logical order
- Use the TodoWrite tool to track progress through steps
- Include important notes section when needed
- Reference relevant ZAMM CLI commands with proper syntax
- Distinguish between implementation-specific and universal requirements

## Guidelines for Workflow Updates

When updating workflow commands:

- Ensure commands reference actual ZAMM CLI capabilities (verify with specs)
- Keep steps focused and actionable
- Avoid assumptions about command syntax - verify against implementation
- Consider whether changes affect related workflows
- Test the workflow by executing it in a representative scenario
