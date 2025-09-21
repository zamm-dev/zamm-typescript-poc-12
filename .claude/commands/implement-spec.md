# Implement the latest spec changes

1. Run the command `eza . --tree --git-ignore` to understand the entire project structure
2. Run the command `git diff HEAD~3..HEAD` to understand the latest requested spec changes and the plan for implementing them
3. Implement. As you go, make note of any unexpected errors and surprises you encounter.
4. Run tests
5. Commit (as many times as specified in the plan)
6. Run `zamm impl record --last-n-commits <N>` where `<N>` is the total number of commits you've made
7. Update the Markdown plan file (the one in `impl-history/`) with any surprises, errors, and results from implementation, including any guidance the user provided along the way for you to end up with the final product.
8. Update `docs/impls/` as appropriate with **concise** updates to implementation-specific development documentation (e.g. changes to project structure, dev commands, or anything else of note to future LLM agents working on this project). If there is nothing to update about the project from a development standpoint, then you may skip this step. You should **never** duplicate feature documentation in this step -- that information belongs in the specs in `docs/`.
9. Commit again (if needed)
