import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from './types';
import { findGitRoot, findMarkdownFiles } from './file-utils';
import { parseFrontmatter } from './frontmatter';

export function detectFileType(filePath: string, gitRoot: string): string {
  const relativePath = path.relative(gitRoot, filePath);

  if (relativePath === 'docs/README.md') {
    return 'project';
  }

  if (relativePath.startsWith('docs/impls/')) {
    return 'implementation';
  }

  if (relativePath.includes('/impl-history/')) {
    return 'ref-impl';
  }

  if (relativePath.includes('/tests/')) {
    return 'test';
  }

  if (relativePath.startsWith('docs/specs/')) {
    return 'spec';
  }

  return 'spec';
}

export function findFileById(id: string): string | null {
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
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter } = parseFrontmatter(fileContent);

      if (frontmatter.id === id) {
        return filePath;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function getFileInfo(filePath: string): FileInfo {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const gitRoot = findGitRoot(absolutePath);
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const fileContent = fs.readFileSync(absolutePath, 'utf8');
  const { frontmatter } = parseFrontmatter(fileContent);

  if (!frontmatter.id) {
    throw new Error(
      'File does not have proper YAML frontmatter with an id field'
    );
  }

  const relativePath = path.relative(gitRoot, absolutePath);
  const fileType = detectFileType(absolutePath, gitRoot);

  return {
    id: frontmatter.id,
    type: fileType,
    filePath: `/${relativePath}`,
    absolutePath,
    gitRoot,
  };
}

export function resolveFileInfo(idOrPath: string): FileInfo {
  let filePath: string;

  if (fs.existsSync(path.resolve(idOrPath))) {
    filePath = path.resolve(idOrPath);
  } else {
    const foundPath = findFileById(idOrPath);
    if (!foundPath) {
      throw new Error(
        `No file found matching the given ID or path: ${idOrPath}`
      );
    }
    filePath = foundPath;
  }

  return getFileInfo(filePath);
}
