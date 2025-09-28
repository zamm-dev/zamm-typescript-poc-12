import { findGitRoot } from '../shared/file-utils';
import { RedirectService } from '../shared/redirect-service';

export interface RedirectOptions {
  directory: string;
}

export async function setRedirect(options: RedirectOptions): Promise<void> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  await RedirectService.setRedirectDirectory(gitRoot, options.directory);
}
