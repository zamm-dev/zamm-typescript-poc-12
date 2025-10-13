import * as fs from 'fs';
import * as path from 'path';
import { RedirectService } from './redirect-service';

export function findGitRoot(startPath: string): string | null {
  let currentPath = path.resolve(startPath);

  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, '.git'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

export function findMarkdownFiles(dirPath: string): string[] {
  const files: string[] = [];

  function walkDir(currentPath: string): void {
    const entries = fs
      .readdirSync(currentPath, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dirPath)) {
    walkDir(dirPath);
  }

  return files.sort();
}

export function extractTitleFromMarkdown(content: string): string | null {
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('# ')) {
      return trimmedLine.substring(2).trim();
    }
  }

  return null;
}

export function resolveTitleFromFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = extractTitleFromMarkdown(content);
    return title || filePath;
  } catch {
    return filePath;
  }
}

export async function getDocsDirectory(): Promise<string> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const redirectDir = await RedirectService.getRedirectDirectory(gitRoot);
  if (redirectDir) {
    if (!fs.existsSync(redirectDir)) {
      throw new Error(`Redirect directory does not exist: ${redirectDir}`);
    }
    return redirectDir;
  }

  const defaultDocsPath = path.join(gitRoot, 'docs');
  if (!fs.existsSync(defaultDocsPath)) {
    throw new Error('docs/ directory not found and no redirect configured');
  }

  return defaultDocsPath;
}

/**
 * Recursively copies directory contents from source to destination
 * @param src - Source directory path
 * @param dest - Destination directory path
 * @param exclude - Optional array of file/directory names to exclude from copying
 */
export function copyDirectory(
  src: string,
  dest: string,
  exclude?: string[]
): void {
  if (!fs.existsSync(src)) {
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (exclude?.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
