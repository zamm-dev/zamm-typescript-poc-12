## Run the following command to see project structure

```bash
eza . --tree --git-ignore
```

## Read the following files

> Read the files below and nothing else.

docs/README.md

Always follow this plan, asking for user feedback at each step:

1. Plan. Think and create a new Markdown file in the appropriate `impl-history/` folder
2. Implement. As you go, update the previous Markdown plan file with the results of terminal command output, as well as any unexpected errors
3. Verify (if applicable). Run tests, compile, do type-checking, etc., depending on the project stack.
4. Commit
5. Update `docs/` as appropriate with **concise** wording around what the user wanted or what is different now about the project (e.g. changes to project structure or commands)
6. Commit again
