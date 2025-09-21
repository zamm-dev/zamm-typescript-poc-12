import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function setupGitConfig(cwd: string): void {
  execSync('git config user.name "Test User"', { cwd });
  execSync('git config user.email "test@example.com"', { cwd });
}

export function createDeterministicCommits(
  cwd: string,
  count: number = 3
): void {
  setupGitConfig(cwd);

  for (let i = 1; i <= count; i++) {
    const testFile = path.join(cwd, `test${i}.txt`);
    fs.writeFileSync(testFile, `Test commit ${i}`);
    execSync(`git add test${i}.txt`, { cwd });

    // Set commit date for deterministic hashes
    const commitDate = `2024-01-0${i} 12:00:00`;
    execSync(
      `GIT_COMMITTER_DATE="${commitDate}" GIT_AUTHOR_DATE="${commitDate}" git commit -m "Test commit ${i}"`,
      { cwd }
    );
  }
}
