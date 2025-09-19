## Run the following command to see project structure

```bash
eza . --tree --git-ignore
```

## Read the following files

> Read the files below and nothing else.
> @docs/README.md
> @docs/impls/nodejs.md

Always follow this plan, asking for user feedback at each step:

1. Plan. Think and create a new Markdown file in the appropriate `impl-history/` folder
2. Commit
3. Implement. As you go, make note of any unexpected errors and surprises you encounter.
4. Run tests
5. Commit
6. Update the plan Markdown file with any surprises, errors, and results from implementation.
7. Update `docs/impls/` as appropriate with **concise** updates to implementation-specific development documentation (e.g. changes to project structure, dev commands, or anything else of note to future LLM agents working on this project). If there is nothing to update about the project from a development standpoint, then you may skip this step. You should **never** duplicate feature documentation in this step -- that information belongs in the specs in `docs/`.
8. Commit again (if needed)
