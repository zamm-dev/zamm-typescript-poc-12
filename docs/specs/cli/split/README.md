---
id: YHZ286
type: spec
---

# `split`

When given a main file and one or more filenames to be split off, `split` should split content from the main file into new separate files. The behavior depends on whether the main file is already named `README.md`:

- **If the main file is already `README.md`**: Create the new files in the same directory as the main file
- **If the main file is not `README.md`**: Create a new folder with the same name as the main file, move the main file to `README.md` under that new folder, and create the new files in that same subdirectory

## File extension handling

If the new filename argument doesn't include a `.md` extension, the command should automatically append it.

## Frontmatter generation

New files created by the split command should automatically receive proper YAML frontmatter with:

- A unique generated ID (three capital letters followed by three numbers)
- The same type as the parent file (inherited from the main file's frontmatter)

> [!NOTE]
> This command does not apply to reference implementation files (files under `impl-history/`) or spec changelog files (files under `spec-history/`).
