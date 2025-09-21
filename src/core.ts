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

  const newContent = `---\n${yamlFrontmatter}\n---\n\n${body}\n`;

  fs.writeFileSync(absolutePath, newContent);
}

function findMarkdownFiles(dirPath: string): string[] {
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

export interface FileInfo {
  id: string;
  type: string;
  filePath: string;
  absolutePath: string;
  gitRoot: string;
}

export interface Implementation {
  id: string;
  name: string;
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

export function getProjectImplementations(gitRoot: string): Implementation[] {
  const implsPath = path.join(gitRoot, 'docs', 'impls');

  if (!fs.existsSync(implsPath)) {
    return [];
  }

  const implementations: Implementation[] = [];
  const implFiles = findMarkdownFiles(implsPath);

  for (const filePath of implFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(fileContent);

      if (frontmatter.id && frontmatter.type === 'implementation') {
        const lines = body.split('\n');
        const titleLine = lines.find(line => line.trim().startsWith('# '));
        const name = titleLine
          ? titleLine.replace(/^#\s*/, '').trim()
          : 'Unknown Implementation';

        implementations.push({
          id: frontmatter.id,
          name,
        });
      }
    } catch {
      continue;
    }
  }

  return implementations.sort((a, b) => a.id.localeCompare(b.id));
}

function formatFileType(type: string): string {
  switch (type) {
    case 'project':
      return 'Project';
    case 'implementation':
      return 'Implementation';
    case 'ref-impl':
      return 'Reference Implementation';
    case 'test':
      return 'Test';
    case 'spec':
      return 'Specification';
    default:
      return type;
  }
}

export function formatFileInfo(
  fileInfo: FileInfo,
  implementations?: Implementation[]
): string {
  const typeFormatted = formatFileType(fileInfo.type);
  let output = `ID: ${fileInfo.id}\nType: ${typeFormatted}\nFile Path: ${fileInfo.filePath}`;

  if (implementations && implementations.length > 0) {
    output += '\nImplementations:';
    for (const impl of implementations) {
      output += `\n  - ${impl.id}: ${impl.name}`;
    }
  }

  // Handle reference implementation files
  if (fileInfo.type === 'ref-impl') {
    try {
      const fileContent = fs.readFileSync(fileInfo.absolutePath, 'utf8');
      const { frontmatter } = parseFrontmatter(fileContent);

      // Display specifications implemented
      if (frontmatter.specs && Array.isArray(frontmatter.specs)) {
        const validSpecs = frontmatter.specs.filter(
          spec =>
            spec && typeof spec === 'object' && 'id' in spec && 'path' in spec
        );

        if (validSpecs.length > 0) {
          output += '\nSpecifications Implemented:';
          for (const spec of validSpecs) {
            const specTyped = spec as { id: string; path: string };
            output += `\n  - ${specTyped.id}: ${specTyped.path}`;
          }
        }
      }

      // Display implementation
      if (
        frontmatter.impl &&
        typeof frontmatter.impl === 'object' &&
        'id' in frontmatter.impl &&
        'path' in frontmatter.impl
      ) {
        const implTyped = frontmatter.impl as { id: string; path: string };
        output += '\nImplementation:';
        output += `\n  - ${implTyped.id}: ${implTyped.path}`;
      }
    } catch {
      // If we can't read the file content, just continue without the extra info
    }
  }

  return output;
}

function resolveFileInfo(idOrPath: string): FileInfo {
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

export function getInfoByIdOrPath(idOrPath: string): string {
  const fileInfo = resolveFileInfo(idOrPath);

  let implementations: Implementation[] | undefined;
  if (fileInfo.type === 'project') {
    implementations = getProjectImplementations(fileInfo.gitRoot);
  }

  return formatFileInfo(fileInfo, implementations);
}

export interface ImplementOptions {
  specIdOrPath: string;
  implIdOrPath: string;
}

export function generateImplementationNote(options: ImplementOptions): string {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  // Reuse existing getInfoByIdOrPath logic to resolve files
  const specInfo = resolveFileInfo(options.specIdOrPath);
  const implInfo = resolveFileInfo(options.implIdOrPath);

  // Validate file types
  if (specInfo.type !== 'spec' && specInfo.type !== 'test') {
    throw new Error(
      `Spec file must be of type 'spec' or 'test', got '${specInfo.type}'`
    );
  }

  if (implInfo.type !== 'implementation') {
    throw new Error(
      `Implementation file must be of type 'implementation', got '${implInfo.type}'`
    );
  }

  // Find the impl-history directory relative to the spec file
  const specDir = path.dirname(specInfo.absolutePath);
  const implHistoryDir = path.join(specDir, 'impl-history');

  // Create impl-history directory if it doesn't exist
  if (!fs.existsSync(implHistoryDir)) {
    fs.mkdirSync(implHistoryDir, { recursive: true });
  }

  // Generate new reference implementation
  const newId = globalIdProvider.generateId();
  const newFileName = `new-${specInfo.id}-impl.md`;
  const newFilePath = path.join(implHistoryDir, newFileName);

  // Create frontmatter
  const frontmatter = {
    id: newId,
    type: 'ref-impl',
    specs: [
      {
        id: specInfo.id,
        path: specInfo.filePath,
      },
    ],
    impl: {
      id: implInfo.id,
      path: implInfo.filePath,
    },
  };

  const yamlFrontmatter = yaml
    .dump(frontmatter, {
      flowLevel: -1,
      noRefs: true,
    })
    .trim();

  const content = `---
${yamlFrontmatter}
---

TODO: LLM agent, please put implementation plan details here and rename this file as appropriate.
`;

  fs.writeFileSync(newFilePath, content);

  return newFilePath;
}
