import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { FileInfo, ImplementOptions } from '../shared/types';
import { findGitRoot } from '../shared/file-utils';
import { resolveFileInfo } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';
import { getLastNCommits, isGitRepository } from '../shared/git-utils';
import {
  parseFrontmatter,
  serializeFrontmatter,
  addCommitsToFrontmatter,
} from '../shared/frontmatter';

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
  if (!isGitRepository()) {
    throw new Error('Not in a git repository');
  }

  const fileInfo = resolveFileInfo(idOrPath);

  if (!fs.existsSync(fileInfo.absolutePath)) {
    throw new Error(`File not found: ${fileInfo.absolutePath}`);
  }

  const content = fs.readFileSync(fileInfo.absolutePath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.id) {
    throw new Error(
      `File does not have proper YAML frontmatter with an id field: ${fileInfo.absolutePath}`
    );
  }

  const commits = getLastNCommits(lastNCommits);
  const updatedFrontmatter = addCommitsToFrontmatter(frontmatter, commits);
  const updatedContent = serializeFrontmatter(updatedFrontmatter, body);

  fs.writeFileSync(fileInfo.absolutePath, updatedContent);
}
