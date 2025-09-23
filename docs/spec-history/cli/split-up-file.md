---
id: TYH425
type: spec
commits:
  - sha: d7ec1e9afcd39c3b8e9ea125290eaa35220b5196
---

# Splitting up Spec and Implementation files

It should be possible to split up spec and implementation files. The `split` command should take in the main file and the filename to be split off.

- If the main file is already `README.md`, then just create the other file in the same directory.
- If the main file is not already `README.md`, then create a new folder with that same name and rename it to `README.md` under that new folder, and create the other file in that new subdirectory.

For example, if the main file is `docs/specs/features.md` and the new file to be split off is `authentication.md` (just `authentication` is also fine for the argument -- we'll append the `.md` extension ourselves in that case), then the main file should be moved to `docs/specs/features/README.md` and the new file will be created in `docs/specs/features/authentication.md`

On the other hand, if the main file is `docs/specs/features/README.md` and the new file to be split off is `authentication.md`, then the main file should be untouched and the new file will be created in `docs/specs/features/authentication.md`.

> [!NOTE]
> This does not apply to reference implementation files.
