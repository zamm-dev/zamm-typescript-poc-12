---
id: IJZ668
type: spec
---

# `feat`

The `feat` command deals with ZAMM behavior during a feature lifecycle.

## `feat start`

`feat start` takes in an arbitrary number of commandline arguments that will all be concatenated into a single string. It will then perform the following actions:

1. Pass the single string to a cheap Anthropic LLM (such as `claude-3-haiku-20240307`) for a new branch name suggestion

   If `ANTHROPIC_API_KEY` is not found in the environment variables, error and exit.

2. Create a new [Git worktree](https://git-scm.com/docs/git-worktree) with this name in a sibling directory:

   ```bash
   git worktree add ../<new-branch-name> -b <new-branch-name>
   ```

   If the new branch name does not start with `zamm/`, prepend `zamm/` to the new branch name so that it's easy to tell which branches are currently managed by the ZAMM feature cycle. However, remove any mentions of ZAMM for the sibling directory path.

   If the sibling directory path still contains slashes after removing `zamm/` from the start, then convert the slashes to hyphens. We don't want arbitrarily deep worktree directories.

   **Conflict Resolution**: Instead of waiting for errors to be thrown, you should first check yourself that the proposed directory and Git branch don't exist yet. If either of them do, ask the LLM for an alternative name suggestion and retry. Allow up to 3 attempts before failing with an appropriate error message.
3. Create a new Spec file in the worktree directory at `docs/spec-history/<sibling-directory-path>.md` with the same name as the sibling directory path, except with a Markdown file extension. This file should contain:
   - The same frontmatter that the `organize` command would populate it with, as specified in [Spec HJQ793](/llm-autostart/docs/specs/cli/organize/README.md)
   - An H1 Markdown title. Ask the LLM to come up with this as well
   - The original command input string, serving as the body for this specification file

Note that in total, there are three LLM calls: initial branch name, spec title, and optionally alternative branch names for conflicts.
