import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { FileInfo, ImplementOptions } from '../shared/types';
import { findGitRoot } from '../shared/file-utils';
import { resolveFileInfo } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';
import { getFileTypeLabel, getFileTypeDescription } from '../shared/file-types';
import { recordCommitsToFile } from '../shared/commit-recorder';

function getNewImplementationNotePath(
  gitRoot: string,
  implInfo: FileInfo,
  specInfo: FileInfo
): string {
  // Get implementation file name for directory structure
  const implFileName = path.basename(implInfo.absolutePath, '.md');

  const normalizedGitRoot = fs.realpathSync(gitRoot);
  const normalizedSpecPath = fs.realpathSync(specInfo.absolutePath);
  const specRelativePath = path.relative(normalizedGitRoot, normalizedSpecPath);

  // Extract subdirectory from spec path
  let specSubPath: string;
  if (specRelativePath.startsWith('docs/specs/')) {
    specSubPath = path.dirname(
      specRelativePath.substring('docs/specs/'.length)
    );
  } else if (specRelativePath.startsWith('docs/spec-history/')) {
    specSubPath = path.dirname(
      specRelativePath.substring('docs/spec-history/'.length)
    );
  } else {
    specSubPath = path.dirname(specRelativePath);
  }

  const implHistoryDir = path.join(
    gitRoot,
    'docs',
    'impl-history',
    implFileName,
    specSubPath
  );

  if (!fs.existsSync(implHistoryDir)) {
    fs.mkdirSync(implHistoryDir, { recursive: true });
  }

  const newFileName = `new-${specInfo.id}-impl.md`;
  const newFilePath = path.join(implHistoryDir, newFileName);

  return newFilePath;
}

export function generateImplementationNote(options: ImplementOptions): string {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  // Get the actual IDs by resolving the file info first
  const specInfo = resolveFileInfo(options.specIdOrPath);
  const implInfo = resolveFileInfo(options.implIdOrPath);

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

  const newId = getIdProvider().generateId();

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

  const newFilePath = getNewImplementationNotePath(gitRoot, implInfo, specInfo);

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

export function recordCommits(idOrPath: string, lastNCommits: number): void {
  recordCommitsToFile(idOrPath, lastNCommits, {
    validateFile: (fileInfo: FileInfo) => {
      // Validate that the file is a reference implementation
      if (fileInfo.type !== 'ref-impl') {
        const typeDescription = getFileTypeDescription(fileInfo.type);
        throw new Error(
          `Error: Implementation commits have to be added to implementation files. The file you entered, ${getFileTypeLabel(fileInfo.type)} ${fileInfo.id} at ${fileInfo.filePath.substring(1)}, is a ${typeDescription} file.`
        );
      }
    },
  });
}
