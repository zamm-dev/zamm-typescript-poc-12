import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface IdProvider {
  generateId(): string;
}

export class RandomIdProvider implements IdProvider {
  generateId(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let id = '';
    for (let i = 0; i < 3; i++) {
      id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return id;
  }
}

let globalIdProvider: IdProvider = new RandomIdProvider();

export function setIdProvider(provider: IdProvider): void {
  globalIdProvider = provider;
}

export function resetIdProvider(): void {
  globalIdProvider = new RandomIdProvider();
}

function findGitRoot(startPath: string): string | null {
  let currentPath = path.resolve(startPath);

  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, '.git'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

function detectFileType(filePath: string, gitRoot: string): string {
  const relativePath = path.relative(gitRoot, filePath);

  if (relativePath === 'docs/README.md') {
    return 'project';
  }

  if (relativePath.startsWith('docs/impls/')) {
    return 'implementation';
  }

  if (relativePath.includes('/impl-history/')) {
    return 'implementation-note';
  }

  if (relativePath.includes('/tests/')) {
    return 'test';
  }

  return 'spec';
}

interface Frontmatter {
  id?: string;
  type?: string;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match && match[1] !== undefined && match[2] !== undefined) {
    try {
      const frontmatter = yaml.load(match[1]) as Frontmatter;
      return { frontmatter: frontmatter || {}, body: match[2].trim() };
    } catch {
      return { frontmatter: {}, body: content.trim() };
    }
  }

  return { frontmatter: {}, body: content.trim() };
}

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

  const updatedFrontmatter = {
    id: frontmatter.id || globalIdProvider.generateId(),
    type: fileType,
    ...frontmatter,
  };

  const yamlFrontmatter = yaml
    .dump(updatedFrontmatter, {
      flowLevel: -1,
      noRefs: true,
    })
    .trim();

  const newContent = `---\n${yamlFrontmatter}\n---\n\n${body}`;

  fs.writeFileSync(absolutePath, newContent);
}
