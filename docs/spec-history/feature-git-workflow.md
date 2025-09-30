---
id: RQY572
type: spec
commits:
  - sha: 3dbe0f98873cadd13257be65c4b29032a46994d0
    message: Update feat command spec to use Bash script for git worktree branching
---

# Use Bash Script for Git Worktree Branching in `zamm feat start`

Use a Bash script in dev/ that intermixes [`aichat`](https://github.com/sigoden/aichat) and Bash commands to do the git worktree branching logic that `zamm feat start` does. Then have `zamm feat start` run that command instead of doing its own Anthropic calls and Git ops.

- zamm shouldn't worry about creating base-state.json anymore
- zamm should still create current-workflow-state.json for itself in the worktree location
