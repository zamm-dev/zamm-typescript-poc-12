---
id: GHK829
type: spec
---

# Development Scripts

Development scripts are meant to help with the ZAMM development workflow lifecycle. They assume that the project is set up with a `base/` folder that hosts the main branch, along with sibling folders for each worktree branch currently being worked on. For example:

```
project-meta-folder/
├── base/                   # main branch
├── some-feat/              # zamm/some-feat branch worktree
└── another-feat/           # zamm/another-feat branch worktree
```

They should be stored in the `dev/` folder of the Git root. That is, `base/dev/` will contain the most up-to-date canonical version of these scripts, and `base/some-feat/dev` may contain the same or updated versions of these scripts specifically for that feature.

> [!NOTE]
> The regular agents working _inside_ of one of these base or worktree directories should not care at all about the project's meta structure. For all they care, their copy of the codebase should be the only one that exists.

## End Worktree Script

The `dev/end-worktree.sh` script provides a standardized way to wrap up work in an existing Git worktree. It assumes that we are currently located in a feature worktree branch, and performs the following steps:

> [!IMPORTANT]
> The script should validate that it is not being run from the main/master branch and should exit with an error if attempted. This prevents accidental execution from the wrong directory.

1. `cd` to the `../base` directory where the main project branch is located
2. `claude 'Merge the <feat-branch> branch into main'`

   For example, if we were previously in the `some-feat/` folder, then we would now run

   ```bash
   claude 'Merge the zamm/some-feat branch into main`'
   ```

   Using Claude allows for an interactive merge in case of merge conflicts.

3. `git worktree remove <dir>`

   To continue the previous example, we would now run

   ```bash
   git worktree remove ../some-feat
   ```

   to clean up the meta project directory structure.

4. `git branch -d <feat-branch>`

   To continue the previous example, we would now run

   ```bash
   git branch -d zamm/some-feat
   ```

   to clean up local git branches.

5. Run the build command for our current implementation to ensure that the main folder always has the latest binaries.

   For example, if our current implementation is using NodeJS with `npm` as the package manager, we would run

   ```bash
   npm run build
   ```

6. `git push` to the remote.
