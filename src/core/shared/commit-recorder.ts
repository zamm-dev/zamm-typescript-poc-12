import * as fs from 'fs';
import { FileInfo } from './types';
import { resolveFileInfo } from './file-resolver';
import { getLastNCommits, isGitRepository } from './git-utils';
import {
  parseFrontmatter,
  serializeFrontmatter,
  addCommitsToFrontmatter,
} from './frontmatter';

export interface CommitRecordingOptions {
  /** Function to validate the file type and path */
  validateFile: (fileInfo: FileInfo) => void;
}

export function recordCommitsToFile(
  idOrPath: string,
  lastNCommits: number,
  options: CommitRecordingOptions
): void {
  if (!isGitRepository()) {
    throw new Error('Not in a git repository');
  }

  const fileInfo = resolveFileInfo(idOrPath);

  if (!fs.existsSync(fileInfo.absolutePath)) {
    throw new Error(`File not found: ${fileInfo.absolutePath}`);
  }

  // Use the custom validation function
  options.validateFile(fileInfo);

  const content = fs.readFileSync(fileInfo.absolutePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.id) {
    throw new Error(
      `File does not have proper YAML frontmatter with an id field: ${fileInfo.absolutePath}`
    );
  }

  const commits = getLastNCommits(lastNCommits);
  const updatedFrontmatter = addCommitsToFrontmatter(frontmatter, commits);
  const updatedContent = serializeFrontmatter(updatedFrontmatter, body);

  fs.writeFileSync(fileInfo.absolutePath, updatedContent);
}
