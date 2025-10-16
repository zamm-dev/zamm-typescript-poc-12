# Improve workflows for future agents

1. Update the specific file in `.claude/commands/` for the previous command that you were given. Put in advice for future agents to collaborate better with the user, based on the user feedback that's been given to you in this interaction.

   For example, if you were just asked to `/implement-spec`, then update `.claude/commands/implement-spec.md` with this advice.

2. Commit the workflow improvement after making the update.

## Guidelines for Updates

- Don't edit _this_ file unless it was invoked specifically for you to improve your own self-improvement
- Keep additions concise - only add what directly addresses user feedback
- Don't expand beyond the specific feedback given
- One line is often sufficient for simple guidance
- Add context about when the lesson applies
- Make it actionable with specific steps or checks to perform
- Include examples where helpful
- Integrate with existing sections instead of creating your own
- Keep it generic
  - Avoid implementation-specific technical details in workflow files. Implementation-specific details (such as language-specific details) go in docs/impls/nodejs.md.
  - Focus on reusable patterns that apply across different projects
- **Put general development practices in `.claude/software-dev-guidelines.md`**, not in workflow-specific command files
  - Workflow files describe _when_ and _how_ to execute a specific command
  - Guidelines describe _what_ constitutes good code/process across all commands
  - Examples: type safety rules, testing practices, commit hygiene belong in guidelines
