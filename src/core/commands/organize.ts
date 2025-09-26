import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  findGitRoot,
  findMarkdownFiles,
  getDocsDirectory,
} from '../shared/file-utils';
import {
  parseFrontmatter,
  updateReferenceImplPaths,
  updateCommitMessages,
} from '../shared/frontmatter';
import { Frontmatter } from '../shared/types';
import { detectFileType } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';

export async function organizeFile(filePath: string): Promise<void> {
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

  const fileType = await detectFileType(absolutePath);

  const baseUpdatedFrontmatter: Frontmatter = {
    id: frontmatter.id || getIdProvider().generateId(),
    type: fileType,
    ...frontmatter,
  };

  let updatedFrontmatter: Frontmatter = baseUpdatedFrontmatter;

  // Update derived metadata for ref-impl files
  if (fileType === 'ref-impl') {
    updatedFrontmatter = await updateReferenceImplPaths(baseUpdatedFrontmatter);
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

export async function organizeAllFiles(): Promise<void> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const docsPath = await getDocsDirectory();
  const markdownFiles = findMarkdownFiles(docsPath);

  for (const filePath of markdownFiles) {
    await organizeFile(filePath);
  }
}
