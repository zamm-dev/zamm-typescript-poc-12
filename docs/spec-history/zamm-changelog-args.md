---
id: YAH054
type: spec
commits:
  - sha: 655c4e575ad47aaf1a418b987467fb8b5348ffae
    message: Add --description and --title arguments to spec changelog command
---

# Extend zamm spec changelog to accept optional --description and --title; auto-generate title from description if --title is omitted using ZAMM Anthropic logic

Have `zamm spec changelog` take in optional --description and --title arguments. If --description is provided but not --title, then generate the title using the existing ZAMM Anthropic logic.
