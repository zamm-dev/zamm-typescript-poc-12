# Implement latest spec changes

Implement the changes to the spec made in the last Git commit.

1. Run the command `git diff main` to see proposed changes to the spec
2. Read the file @docs/impls/nodejs.md to understand the state of the current implementation
3. Run the command `zamm impl create --spec <spec ID> --for docs/impls/nodejs.md` to create a new implementation plan file
4. Rename and edit the generated file with a plan for implementation. You may read the code in the rest of the repo, but do not make any changes. This is only a planning step.

   Note that if there are natural checkpoints for your plan, you may include multiple commits as part of the plan. Natural checkpoints should not be divided between changes to code versus changes to tests, but rather between different logical phases (for example, one commit for backend code and another for frontend code). If there's no natural checkpoints, or if the entirety of the changes are small enough, you should just keep the whole thing as a single commit.

5. Commit
