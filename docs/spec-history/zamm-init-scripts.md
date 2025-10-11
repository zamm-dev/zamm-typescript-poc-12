---
id: XEY874
type: spec
commits:
  - sha: 8ca372c2012e7256e65e6234b8f1f8a6b90ba221
    message: Add spec for init scripts command
---

# zamm init scripts for dev script and Claude command installation

Add a `zamm init scripts --impl <IMPL_ID_OR_PATH>` command that installs the same dev/ scripts and .claude/commands/ that ZAMM itself has. The Claude commands should be based off of templates that have references to ZAMM implementations replaced by references in the project we are installing ZAMM scripts into. These templates should reside in a resource directory and be included in the built version of ZAMM.

So for example, mentions to `docs/impls/nodejs.md` in ZAMM's Claude command files will effectively be replaced by mentions to `new-proj-zamm-dir/impls/new-proj-impl.md`, where that path is determined by the location of the `--impl` file referenced in the command. You can use existing spec searching logic to determine the impl file location.

The "Setup worktree environment" section of `dev/start-worktree.sh` should also be replaced by setup instructions (if any) in the new project's impl file; this is where you should invoke Claude to intelligently retrieve bash setup commands from the specified impl file during `zamm init`. Make sure that the template resources make this obvious.
