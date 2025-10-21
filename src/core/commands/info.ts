import * as fs from 'fs';
import * as path from 'path';
import { FileInfo, Implementation } from '../shared/types';
import {
  findMarkdownFiles,
  resolveTitleFromFile,
  getDocsDirectory,
} from '../shared/file-utils';
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

export async function getProjectImplementations(): Promise<Implementation[]> {
  const docsDir = await getDocsDirectory();
  const implsPath = path.join(docsDir, 'impls');

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

export async function formatFileInfo(
  fileInfo: FileInfo,
  implementations?: Implementation[]
): Promise<string> {
  const typeFormatted = formatFileType(fileInfo.type);
  let output = `ID: ${fileInfo.id}\nType: ${typeFormatted}\nFile Path: ${fileInfo.displayPath}`;

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
      const docsDir = await getDocsDirectory();

      if (frontmatter.specs && Array.isArray(frontmatter.specs)) {
        const validSpecs = frontmatter.specs.filter(
          spec =>
            spec && typeof spec === 'object' && 'id' in spec && 'path' in spec
        );

        if (validSpecs.length > 0) {
          output += '\nSpecifications Implemented:';
          for (const spec of validSpecs) {
            const specTyped = spec as { id: string; path: string };
            const specPath = path.join(docsDir, specTyped.path);
            const title = resolveTitleFromFile(specPath);
            const displayText =
              title === specPath ? `\x1b[31m${specTyped.path}\x1b[0m` : title;
            output += `\n  - ${specTyped.id}: ${displayText}`;
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
        const implPath = path.join(docsDir, implTyped.path);
        const title = resolveTitleFromFile(implPath);
        const displayText =
          title === implPath ? `\x1b[31m${implTyped.path}\x1b[0m` : title;
        output += '\nImplementation:';
        output += `\n  - ${implTyped.id}: ${displayText}`;
      }

      if (frontmatter.commits && Array.isArray(frontmatter.commits)) {
        const validCommits = frontmatter.commits.filter(
          commit =>
            commit &&
            typeof commit === 'object' &&
            'sha' in commit &&
            'message' in commit
        );

        if (validCommits.length > 0) {
          output += '\nCommits:';
          for (const commit of validCommits) {
            const commitTyped = commit as { sha: string; message: string };
            const shortSha = commitTyped.sha.substring(0, 7);
            output += `\n  - ${shortSha}: ${commitTyped.message}`;
          }
        }
      }
    } catch {
      // If we can't read the file content, just continue without the extra info
    }
  }

  return output;
}

export async function getInfoByIdOrPath(idOrPath: string): Promise<string> {
  const fileInfo = await resolveFileInfo(idOrPath);

  let implementations: Implementation[] | undefined;
  if (fileInfo.type === 'project') {
    implementations = await getProjectImplementations();
  }

  return await formatFileInfo(fileInfo, implementations);
}
