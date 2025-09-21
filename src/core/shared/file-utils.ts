import * as fs from 'fs';
import * as path from 'path';

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
