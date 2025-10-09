---
id: GMR022
type: spec
commits:
  - sha: a7b4d0c96f8aa5d16e8385ca7710bbaba21f4660
    message: >-
      Update end-worktree spec: prevent fast-forward merges and exit on merge
      failure
---

# `end-worktree.sh`: Avoid fast-forward merges to main and exit on Claude merge failure

Change end-worktree.sh to not do fast-forward merges back into main, and to exit if Claude merge failed (e.g. if the user exits Claude without completing the merge)
