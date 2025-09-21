import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ImplementOptions } from '../shared/types';
import { findGitRoot } from '../shared/file-utils';
import { resolveFileInfo } from '../shared/file-resolver';
import { getIdProvider } from '../shared/id-provider';

export function generateImplementationNote(options: ImplementOptions): string {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

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

  const implFileName = path.basename(implInfo.absolutePath, '.md');

  const normalizedGitRoot = fs.realpathSync(gitRoot);
  const normalizedSpecPath = fs.realpathSync(specInfo.absolutePath);
  const specRelativePath = path.relative(normalizedGitRoot, normalizedSpecPath);
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

  const newId = getIdProvider().generateId();
  const newFileName = `new-${specInfo.id}-impl.md`;
  const newFilePath = path.join(implHistoryDir, newFileName);

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
