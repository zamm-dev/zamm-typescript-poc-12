import { findGitRoot } from '../shared/file-utils';
import { BaseWorkflowService } from '../shared/workflow-service';

export interface RedirectOptions {
  directory: string;
}

export async function setRedirect(options: RedirectOptions): Promise<void> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  await BaseWorkflowService.setRedirectDirectory(gitRoot, options.directory);
}
