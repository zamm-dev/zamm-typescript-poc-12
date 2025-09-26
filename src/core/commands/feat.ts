import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { getIdProvider } from '../shared/id-provider';
import { findGitRoot } from '../shared/file-utils';
import { getAnthropicService } from '../shared/anthropic-service';
import { branchExists } from '../shared/git-utils';
import {
  BaseWorkflowService,
  WorktreeWorkflowService,
} from '../shared/workflow-service';

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
  // Get Anthropic service from global singleton
  const anthropicService = getAnthropicService();

  // Find git root
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  // 1. Initialize .zamm/ structure in the base directory if it hasn't already been
  await BaseWorkflowService.initialize(gitRoot);

  // Get branch name suggestion from Anthropic
  const rawBranchName = await anthropicService.suggestBranchName(
    options.description
  );
  let { branchName, siblingDirName, siblingPath } = processBranchName(
    rawBranchName,
    gitRoot
  );

  // Check for conflicts proactively and retry with new name if needed
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    // Check if branch already exists
    const branchAlreadyExists = branchExists(branchName, gitRoot);
    // Check if directory already exists
    const directoryAlreadyExists = fs.existsSync(siblingPath);

    if (branchAlreadyExists || directoryAlreadyExists) {
      retryCount++;

      if (retryCount >= maxRetries) {
        const conflicts = [];
        if (branchAlreadyExists) conflicts.push(`branch '${branchName}'`);
        if (directoryAlreadyExists)
          conflicts.push(`directory '${siblingPath}'`);

        throw new Error(
          `Failed to create unique branch/directory after ${maxRetries} attempts: ${conflicts.join(' and ')} already exist`
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
      // No conflicts, create the worktree
      execSync(`git worktree add "${siblingPath}" -b "${branchName}"`, {
        cwd: gitRoot,
        stdio: 'inherit',
      });
      break; // Success, exit the loop
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

  // 5. Initialize .zamm/ structure in the fresh worktree directory
  await WorktreeWorkflowService.initialize(siblingPath);

  // 6. Update .zamm/ in the base directory to track this new worktree directory
  await BaseWorkflowService.addWorktree(gitRoot, branchName, siblingPath);

  // 7. Show the user a message telling them to run the commands
  console.log(`\nWorkflow initialized! Next steps:`);
  console.log(`cd ../${siblingDirName} && claude "/change-spec"`);
}
