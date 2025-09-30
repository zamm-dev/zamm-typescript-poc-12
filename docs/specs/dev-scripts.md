---
id: GHK829
type: spec
---

# Development Scripts

This is a specification for development scripts that are specific to this project. They assume a development workflow based on Git worktrees, where:

- The project is set up with a `base/` folder that hosts the main branch
- Each worktree branch currently being worked on exists on a sibling branch. These get cleaned up as each feature is finished.

For example:

```
project-meta-folder/
├── base/                   # main branch
├── some-feat/              # zamm/some-feat branch worktree
└── another-feat/           # zamm/another-feat branch worktree
```

The development scripts should be stored in the `dev/` folder of the Git root. That is, `base/dev/` will contain the most up-to-date canonical version of these scripts, and `base/some-feat/dev` may contain the same or updated versions of these scripts specifically for that feature.

> [!NOTE]
> The regular agents working _inside_ of one of these base or worktree directories should not care at all about the project's meta structure. For all they care, their copy of the codebase should be the only one that exists.

## Start Worktree Script

The `dev/start-worktree.sh` script provides a standardized way to start work in a new Git worktree. It assumes that we are currently located in the base branch, and performs the following steps:

1. Take in a single input string containing a description of the feature to be worked on
2. Pass the single input string to a cheap Anthropic LLM (such as `claude-3-haiku-20240307`) for a new branch name suggestion
3. Create a new [Git worktree](https://git-scm.com/docs/git-worktree) with this name in a sibling directory:

   ```bash
   git worktree add ../<new-worktree-dir> -b zamm/<new-branch-name>
   ```

   Prepend `zamm/` to the new branch name so that it's easy to tell which branches are currently managed by the ZAMM feature cycle.

   Convert any slashes to hyphens when generating the sibling directory path. We don't want arbitrarily deep worktree directories. Make sure that the sibling directory path is not prefixed with `zamm-`: if the LLM suggests `some-feat-name` as a branch name, the Git branch should be `zamm/some-feat-branch` but the sibling directory should be `../some-feat-name/`

   **Conflict Resolution**: Proactively check that the proposed directory and Git branch don't exist before attempting creation. If conflicts exist, ask the LLM for an alternative name suggestion and retry. Allow up to 3 attempts before failing with an appropriate error message.

4. Create a new Spec file in `docs/spec-history/<sibling-directory-path>.md` with the same name as the sibling directory path, except with a Markdown file extension. Use the `zamm spec changelog` command to do this.
5. Append to the file:
   - An H1 Markdown title. Ask the LLM to come up with this as well
   - The original command input string, serving as the body for this specification file
6. Show the user a message telling them to run the command

   ```bash
   cd ../<new-worktree-dir> && claude "/change-spec"
   ```

> [!IMPORTANT]
> The script should validate that it **_is_** being run from the main/master branch and should exit with an error if this is not the case. This prevents accidental execution from the wrong directory.

## End Worktree Script

The `dev/end-worktree.sh` script provides a standardized way to wrap up work in an existing Git worktree. It assumes that we are currently located in a feature worktree branch, and performs the following steps:

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

> [!IMPORTANT]
> The script should validate that it is **_not_** being run from the main/master branch and should exit with an error if attempted. This prevents accidental execution from the wrong directory.
