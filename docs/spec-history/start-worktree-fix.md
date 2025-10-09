---
id: CJC594
type: spec
commits:
  - sha: c48c6b1ae95a462e957aa607f834c61c24f66dde
    message: Update start-worktree.sh spec to handle npm install and Claude trust
---

# Automate npm install in start-worktree.sh

`npm install` on `zamm feat start` should be handled by `start-worktree.sh` instead of requiring manual setup via Claude instructions.

Note: Automatically trusting the new worktree directory in Claude Code is currently not possible from a bash script. The ideal workflow would be to run `claude` from the parent directory (which contains both the base repo and all sibling worktrees) and have Claude prompt the user to trust that parent directory. However, this requires manual user interaction and cannot be automated at this time.
