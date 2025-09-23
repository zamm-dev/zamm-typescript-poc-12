import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { findGitRoot } from '../shared/file-utils';
import { parseFrontmatter } from '../shared/frontmatter';
import { detectFileType } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';
import { Frontmatter } from '../shared/types';

export interface SplitOptions {
  mainFilePath: string;
  newFileName: string;
}

export function splitFile(options: SplitOptions): void {
  const { mainFilePath, newFileName } = options;

  const absoluteMainPath = path.resolve(mainFilePath);

  if (!fs.existsSync(absoluteMainPath)) {
    throw new Error(`File not found: ${mainFilePath}`);
  }

  const gitRoot = findGitRoot(absoluteMainPath);
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  // Check if this is a reference implementation file or spec history file
  const relativePath = path.relative(gitRoot, absoluteMainPath);
  if (
    relativePath.includes('impl-history/') ||
    relativePath.includes('spec-history/')
  ) {
    throw new Error(
      'Split command does not apply to reference implementation files or spec changelog files'
    );
  }

  // Read the main file to get its frontmatter and type
  const mainFileContent = fs.readFileSync(absoluteMainPath, 'utf8');
  const { frontmatter: mainFrontmatter } = parseFrontmatter(mainFileContent);

  // Ensure the new filename has .md extension
  const newFileNameWithExt = newFileName.endsWith('.md')
    ? newFileName
    : `${newFileName}.md`;

  const mainDir = path.dirname(absoluteMainPath);
  const mainBaseName = path.basename(absoluteMainPath, '.md');
  const mainFileName = path.basename(absoluteMainPath);

  // Determine the target directory and new file path
  let newFilePath: string;

  if (mainFileName === 'README.md') {
    // Case 1: Main file is already README.md - create new file in same directory
    newFilePath = path.join(mainDir, newFileNameWithExt);

    if (fs.existsSync(newFilePath)) {
      throw new Error(`File already exists: ${newFilePath}`);
    }
  } else {
    // Case 2: Main file is not README.md - create folder and move files
    const newDirPath = path.join(mainDir, mainBaseName);
    const newMainPath = path.join(newDirPath, 'README.md');
    newFilePath = path.join(newDirPath, newFileNameWithExt);

    if (fs.existsSync(newDirPath)) {
      throw new Error(`Directory already exists: ${newDirPath}`);
    }

    // Create the new directory
    fs.mkdirSync(newDirPath, { recursive: true });

    // Move the main file to README.md in the new directory
    fs.renameSync(absoluteMainPath, newMainPath);
  }

  // Generate frontmatter for the new file, inheriting type from parent
  const fileType = detectFileType(newFilePath, gitRoot);
  const parentType = mainFrontmatter.type || fileType;

  const newFileFrontmatter: Frontmatter = {
    id: getIdProvider().generateId(),
    type: parentType,
  };

  const yamlFrontmatter = yaml
    .dump(newFileFrontmatter, {
      flowLevel: -1,
      noRefs: true,
    })
    .trim();

  const newFileContent = `---\n${yamlFrontmatter}\n---\n`;

  // Create new file with frontmatter
  fs.writeFileSync(newFilePath, newFileContent);
}
