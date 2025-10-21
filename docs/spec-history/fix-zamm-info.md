---
id: MQX251
type: spec
commits:
  - sha: e0d539532e3aa97886370e98ec6597a091ff9fce
    message: Fix info command spec for path resolution and missing file display
---

# Fix `zamm info` no longer correctly showing spec titles due to relative paths

Fix `zamm info` no longer correctly showing spec titles because the paths are now relative to docs root (e.g. `docs/` rather than Git root. Also, make it so that any files that aren't found are highlighted in red in the terminal output
