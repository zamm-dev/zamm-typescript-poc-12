---
id: RYK994
type: spec
---

# `info`

The `info` command displays structured information about a given file. The file can be specified by either its ID or file path. Details on the structured information to output are found below.

## General information (for all files):

- **ID**: The unique identifier from the file's frontmatter
- **Type**: The file type in proper English format:
  - `project` → "Project"
  - `implementation` → "Implementation"
  - `ref-impl` → "Reference Implementation"
  - `test` → "Test"
  - `spec` → "Specification"
- **File Path**: The absolute path to the file, relative to the project root

## Additional information for project files:

- **Implementations**: A list of all implementation files associated with this project, showing:
  - Implementation ID and title (from the level 1 Markdown heading)

## Additional information for reference implementation files:

- **Specifications Implemented**: A list of all specification files referenced in the `specs` frontmatter field, showing:
  - Specification ID and title (from the level 1 Markdown heading)
- **Implementation**: The single implementation file referenced in the `impl` frontmatter field, showing:
  - Implementation ID and title (from the level 1 Markdown heading)
- **Commits**: Display the commits of the reference implementation, showing:
  - First 7 characters of the commit SHA
  - First line of the commit message

> [!NOTE]
> **Title Fallback Behavior**: Whenever displaying file references (implementations, specifications, etc.), always prefer showing the title from the level 1 Markdown heading. Only if no title is available should the system fall back to displaying the file path.

## Error handling

The command should error out if:

- No file is found matching the given ID or path
- The specified file does not have proper YAML frontmatter with an `id` field
- The `.git` directory cannot be found (to determine the project root)
