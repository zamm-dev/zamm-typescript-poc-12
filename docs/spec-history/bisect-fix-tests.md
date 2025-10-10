---
id: LPC593
type: spec
---

# Git Bisect to Fix Failing Tests After Pre-Push Hook

Git bisect and fix failing tests. It is weird because it worked fine previously -- the git pre-push hook ran the tests when main was pushed to origin/main, but now tests are failing without any further changes, even on a fresh clone of the repo.
