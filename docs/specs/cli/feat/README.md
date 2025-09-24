---
id: IJZ668
type: spec
---

# `feat`

The `feat` command deals with ZAMM behavior during a feature lifecycle.

## Workflow Lifecycle

ZAMM assumes the use of a Git worktree workflow in collaboration with Claude Code. ZAMM tracks the progression of this workflow through its various stages through the use of a `.zamm/` directory that is entirely Git-ignored via a `.zamm/.gitignore` file.

### `.zamm/` in the base directory

In the base directory, it should consist of a `base-state.json` file that keeps track of all outstanding worktrees, their branches, folder path, and current state. If the worktree directory no longer exists, the state should be assumed to be `COMPLETED`.

### `.zamm/` in worktree directories

There should be a `.zamm/current-workflow-state.json` file that keeps track of the current state of the workflow (`INITIAL`, `SPEC-UPDATED`, `SPEC-IMPLEMENTED`).

## `feat start`

`feat start` takes in an arbitrary number of commandline arguments that will all be concatenated into a single string. It will then perform the following actions:

1. Initialize `.zamm/` structure in the base directory if it hasn't already been
2. Pass the single input string to a cheap Anthropic LLM (such as `claude-3-haiku-20240307`) for a new branch name suggestion

   If `ANTHROPIC_API_KEY` is not found in the environment variables, error and exit.

3. Create a new [Git worktree](https://git-scm.com/docs/git-worktree) with this name in a sibling directory:

   ```bash
   git worktree add ../<new-branch-name> -b <new-branch-name>
   ```

   If the new branch name does not start with `zamm/`, prepend `zamm/` to the new branch name so that it's easy to tell which branches are currently managed by the ZAMM feature cycle. However, remove any mentions of ZAMM for the sibling directory path.

   If the sibling directory path still contains slashes after removing `zamm/` from the start, then convert the slashes to hyphens. We don't want arbitrarily deep worktree directories.

   **Conflict Resolution**: If the branch name or directory already exists, ask the LLM for an alternative name suggestion and retry. Allow up to 3 attempts before failing with an appropriate error message.

4. Create a new Spec file in `docs/spec-history/<sibling-directory-path>.md` with the same name as the sibling directory path, except with a Markdown file extension. This file should contain:
   - The same frontmatter that the `organize` command would populate it with, as specified in [Spec HJQ793](/llm-autostart/docs/specs/cli/organize/README.md)
   - An H1 Markdown title. Ask the LLM to come up with this as well
   - The original command input string, serving as the body for this specification file
5. Initialize `.zamm/` structure in the fresh worktree directory, including information on the `INITIAL` state of the worktree directory.
6. Update `.zamm/` in the base directory to track this new worktree directory.
7. Show the user a message telling them to run the commands

   ```bash
   cd ../<new-worktree-dir> && claude "/change-spec"
   ```

> [!NOTE]
> In total, there are three LLM calls here: initial branch name, spec title, and optionally alternative branch names for conflicts.
