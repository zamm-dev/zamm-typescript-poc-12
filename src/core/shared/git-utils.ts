import { execSync } from 'child_process';
import { Commit } from './types';

export function getLastNCommits(n: number): Commit[] {
  try {
    const output = execSync(`git log -n ${n} --pretty=format:"%H%x09%s"`, {
      encoding: 'utf8',
      cwd: process.cwd(),
    });

    return output
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => {
        const [sha, message] = line.split('\t');
        return { sha: sha || '', message: message || '' };
      });
  } catch (error) {
    throw new Error(
      `Failed to get git commit history: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function getCommitMessage(sha: string): string | null {
  try {
    const output = execSync(`git log -1 --pretty=format:"%s" ${sha}`, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
    });
    return output.trim();
  } catch {
    return null;
  }
}

export function isGitRepository(): boolean {
  try {
    execSync('git rev-parse --git-dir', {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

export function branchExists(branchName: string, gitRoot: string): boolean {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, {
      cwd: gitRoot,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}
