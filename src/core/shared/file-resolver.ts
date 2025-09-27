import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from './types';
import { findGitRoot, findMarkdownFiles, getDocsDirectory } from './file-utils';
import { parseFrontmatter } from './frontmatter';

export async function detectFileType(filePath: string): Promise<string> {
  const docsDir = await getDocsDirectory();

  // Resolve symlinks to ensure consistent path representation (e.g., /var vs /private/var on macOS)
  const resolvedDocsDir = fs.realpathSync(docsDir);

  // For non-existent files, use the path as-is instead of resolving symlinks
  let resolvedFilePath: string;
  try {
    resolvedFilePath = fs.realpathSync(filePath);
  } catch {
    // File doesn't exist, use absolute path for consistent calculation
    resolvedFilePath = path.resolve(filePath);
  }

  const relativePath = path.relative(resolvedDocsDir, resolvedFilePath);

  if (relativePath === 'README.md') {
    return 'project';
  }

  if (relativePath.startsWith('impls/')) {
    return 'implementation';
  }

  if (relativePath.includes('impl-history/')) {
    return 'ref-impl';
  }

  if (relativePath.includes('tests/')) {
    return 'test';
  }

  if (relativePath.startsWith('specs/')) {
    return 'spec';
  }

  return 'spec';
}

export async function findFileById(id: string): Promise<string | null> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const docsPath = await getDocsDirectory();
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

export async function getFileInfo(filePath: string): Promise<FileInfo> {
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

  const docsDir = await getDocsDirectory();
  const fileType = frontmatter.type || (await detectFileType(absolutePath));

  // Resolve symlinks to ensure consistent path representation (e.g., /var vs /private/var on macOS)
  const resolvedDocsDir = fs.realpathSync(docsDir);
  const resolvedAbsolutePath = fs.realpathSync(absolutePath);

  // Path relative to docs directory for internal storage
  const docsRelativePath = path.relative(resolvedDocsDir, resolvedAbsolutePath);

  // Path relative to current directory for user display
  const resolvedCwd = fs.realpathSync(process.cwd());
  const currentDirRelativePath = path.relative(
    resolvedCwd,
    resolvedAbsolutePath
  );

  return {
    id: frontmatter.id,
    type: fileType,
    filePath: `/${docsRelativePath}`,
    displayPath: currentDirRelativePath,
    absolutePath,
    gitRoot,
  };
}

export async function resolveFileInfo(idOrPath: string): Promise<FileInfo> {
  let filePath: string;

  if (fs.existsSync(path.resolve(idOrPath))) {
    filePath = path.resolve(idOrPath);
  } else {
    const foundPath = await findFileById(idOrPath);
    if (!foundPath) {
      throw new Error(
        `No file found matching the given ID or path: ${idOrPath}`
      );
    }
    filePath = foundPath;
  }

  return await getFileInfo(filePath);
}
