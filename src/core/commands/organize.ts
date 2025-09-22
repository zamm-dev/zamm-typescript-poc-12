import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { findGitRoot, findMarkdownFiles } from '../shared/file-utils';
import {
  parseFrontmatter,
  updateReferenceImplPaths,
  updateCommitMessages,
} from '../shared/frontmatter';
import { Frontmatter } from '../shared/types';
import { detectFileType } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';

export function organizeFile(filePath: string): void {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const gitRoot = findGitRoot(absolutePath);
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(fileContent);

  const fileType = detectFileType(absolutePath, gitRoot);

  const baseUpdatedFrontmatter: Frontmatter = {
    id: frontmatter.id || getIdProvider().generateId(),
    type: fileType,
    ...frontmatter,
  };

  let updatedFrontmatter: Frontmatter = baseUpdatedFrontmatter;

  // Update derived metadata for ref-impl files
  if (fileType === 'ref-impl') {
    updatedFrontmatter = updateReferenceImplPaths(baseUpdatedFrontmatter);
    updatedFrontmatter = updateCommitMessages(updatedFrontmatter);
  }

  const yamlFrontmatter = yaml
    .dump(updatedFrontmatter, {
      flowLevel: -1,
      noRefs: true,
    })
    .trim();

  const newContent = `---\n${yamlFrontmatter}\n---\n\n${body}\n`;

  fs.writeFileSync(absolutePath, newContent);
}

export function organizeAllFiles(): void {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const docsPath = path.join(gitRoot, 'docs');
  if (!fs.existsSync(docsPath)) {
    throw new Error('docs/ directory not found');
  }

  const markdownFiles = findMarkdownFiles(docsPath);

  for (const filePath of markdownFiles) {
    organizeFile(filePath);
  }
}
