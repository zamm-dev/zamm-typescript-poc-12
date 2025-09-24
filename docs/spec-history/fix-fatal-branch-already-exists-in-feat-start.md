---
id: SJC776
type: spec
commits:
  - sha: bd0c81cb7a35c3bbb4f6ac5bda24c064f0d2d205
---

# Properly handle duplicate Git branches in `feat start`

Handle the error "fatal: a branch named 'zamm/spec-record-for-spec-history' already exists" in `feat start`. There should already be code to handle this, but it appears that code is not handling it
