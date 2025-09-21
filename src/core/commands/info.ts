import * as fs from 'fs';
import * as path from 'path';
import { FileInfo, Implementation } from '../shared/types';
import { findMarkdownFiles } from '../shared/file-utils';
import { parseFrontmatter } from '../shared/frontmatter';
import { resolveFileInfo } from '../shared/file-resolver';

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

  if (fileInfo.type === 'ref-impl') {
    try {
      const fileContent = fs.readFileSync(fileInfo.absolutePath, 'utf8');
      const { frontmatter } = parseFrontmatter(fileContent);

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

export function getInfoByIdOrPath(idOrPath: string): string {
  const fileInfo = resolveFileInfo(idOrPath);

  let implementations: Implementation[] | undefined;
  if (fileInfo.type === 'project') {
    implementations = getProjectImplementations(fileInfo.gitRoot);
  }

  return formatFileInfo(fileInfo, implementations);
}
