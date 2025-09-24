import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { getIdProvider } from '../shared/id-provider';
import { findGitRoot } from '../shared/file-utils';
import { AnthropicService } from '../shared/anthropic-service';

export interface FeatStartOptions {
  description: string;
}

function processBranchName(
  rawBranchName: string,
  gitRoot: string
): {
  branchName: string;
  siblingDirName: string;
  siblingPath: string;
} {
  // Sanitize branch name: replace spaces with hyphens, remove invalid characters
  let branchName = rawBranchName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-/]/g, '');

  // Prepend zamm/ if not already present
  if (!branchName.startsWith('zamm/')) {
    branchName = `zamm/${branchName}`;
  }

  // Create sibling directory name by removing zamm/ and converting slashes to hyphens
  const siblingDirName = branchName.replace(/^zamm\//, '').replace(/\//g, '-');
  const siblingPath = path.join(path.dirname(gitRoot), siblingDirName);

  return {
    branchName,
    siblingDirName,
    siblingPath,
  };
}

export async function featStart(options: FeatStartOptions): Promise<void> {
  // Initialize Anthropic service
  const anthropicService = new AnthropicService();

  // Find git root
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  // Get branch name suggestion from Anthropic
  const rawBranchName = await anthropicService.suggestBranchName(
    options.description
  );
  let { branchName, siblingDirName, siblingPath } = processBranchName(
    rawBranchName,
    gitRoot
  );

  // Create git worktree, retry with new name if conflict occurs
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      execSync(`git worktree add "${siblingPath}" -b "${branchName}"`, {
        cwd: gitRoot,
        stdio: 'inherit',
      });
      break; // Success, exit the loop
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a conflict error
      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('not a valid branch name')
      ) {
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error(
            `Failed to create unique branch/directory after ${maxRetries} attempts: ${errorMessage}`
          );
        }

        // Ask Claude for a new branch name
        const rawRetryBranchName =
          await anthropicService.suggestAlternativeBranchName(
            options.description,
            branchName
          );
        ({ branchName, siblingDirName, siblingPath } = processBranchName(
          rawRetryBranchName,
          gitRoot
        ));
      } else {
        // Some other error, rethrow
        throw error;
      }
    }
  }

  // Get spec title from Anthropic
  const specTitle = await anthropicService.suggestSpecTitle(
    options.description
  );

  // Create spec file in docs/spec-history/ of the worktree
  const specFilePath = path.join(
    siblingPath,
    'docs',
    'spec-history',
    `${siblingDirName}.md`
  );

  // Ensure the spec-history directory exists
  const specHistoryDir = path.dirname(specFilePath);
  if (!fs.existsSync(specHistoryDir)) {
    fs.mkdirSync(specHistoryDir, { recursive: true });
  }

  // Generate frontmatter
  const id = getIdProvider().generateId();
  const frontmatter = `---
id: ${id}
type: spec
---

# ${specTitle}

${options.description}
`;

  fs.writeFileSync(specFilePath, frontmatter);
}
