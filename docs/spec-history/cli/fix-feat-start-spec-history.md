---
id: RTD017
type: spec
---

# Fix `feat start` spec history

No spec history file is currently being created upon invoking `zamm feat start`. This should be fixed.

(It turns out the file is being created in the base project directory, not in the worktree directory as it should be.)
