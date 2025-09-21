---
id: NXA068
type: spec
commits:
  - sha: 300e74cfcad352f7054371d3f225c32386802834
---

# Info Title and Commits

## Titles with IDs

`info` command should list names next to IDs. So instead of

```
Specifications Implemented:
  - YSI785: /docs/spec-history/impl-record-commits.md
```

it would be

```
Specifications Implemented:
  - YSI785: Implementation Record Commits
```

Only if there are no titles available should it fall back to displaying the path.

This goes for all references to docs/ files (e.g. this also includes implementation files).

## Displaying commits

`info` should display the commits of reference implementations. The first 7 characters of the commit should be shown along with the first line of the commit message.
