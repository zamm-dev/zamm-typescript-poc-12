import * as yaml from 'js-yaml';
import { Frontmatter, Commit, FileReference } from './types';
import { resolveFileInfo } from './file-resolver';
import { getCommitMessage } from './git-utils';

export function parseFrontmatter(content: string): {
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

export function serializeFrontmatter(
  frontmatter: Frontmatter,
  body: string
): string {
  const yamlContent = yaml
    .dump(frontmatter, {
      flowLevel: -1,
      noRefs: true,
    })
    .trim();

  // Handle empty body case - only add two newlines after frontmatter
  if (body.trim() === '') {
    return `---\n${yamlContent}\n---\n\n`;
  }

  return `---\n${yamlContent}\n---\n\n${body}\n`;
}

export function addCommitsToFrontmatter(
  frontmatter: Frontmatter,
  newCommits: Commit[]
): Frontmatter {
  const updatedFrontmatter = { ...frontmatter };

  if (updatedFrontmatter.commits) {
    // Prepend new commits to existing ones (most recent first)
    updatedFrontmatter.commits = [...newCommits, ...updatedFrontmatter.commits];
  } else {
    updatedFrontmatter.commits = newCommits;
  }

  return updatedFrontmatter;
}

async function updateFileReference(
  fileRef: FileReference,
  validateTypes = false,
  expectedTypes: string[] = [],
  refType = 'file'
): Promise<FileReference> {
  try {
    const fileInfo = await resolveFileInfo(fileRef.id);

    if (
      validateTypes &&
      expectedTypes.length > 0 &&
      !expectedTypes.includes(fileInfo.type)
    ) {
      throw new Error(
        `${refType} file must be of type ${expectedTypes.map(t => `'${t}'`).join(' or ')}, got '${fileInfo.type}'`
      );
    }

    return {
      ...fileRef,
      path: fileInfo.filePath,
    };
  } catch (error) {
    if (validateTypes) {
      throw error; // Re-throw validation errors
    }
    console.warn(
      `Warning: Could not resolve ${refType} file for ID ${fileRef.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    // Remove path if resolution fails
    const { path: _, ...fileRefWithoutPath } = fileRef;
    return fileRefWithoutPath;
  }
}

export async function updateReferenceImplPaths(
  frontmatter: Frontmatter,
  validateTypes = false
): Promise<Frontmatter> {
  const updatedFrontmatter = { ...frontmatter };

  // Update spec paths
  if (updatedFrontmatter.specs && Array.isArray(updatedFrontmatter.specs)) {
    updatedFrontmatter.specs = await Promise.all(
      updatedFrontmatter.specs.map(spec =>
        updateFileReference(spec, validateTypes, ['spec', 'test'], 'Spec')
      )
    );
  }

  // Update impl path
  if (
    updatedFrontmatter.impl &&
    typeof updatedFrontmatter.impl === 'object' &&
    updatedFrontmatter.impl.id
  ) {
    updatedFrontmatter.impl = await updateFileReference(
      updatedFrontmatter.impl,
      validateTypes,
      ['implementation'],
      'Implementation'
    );
  }

  return updatedFrontmatter;
}

export function updateCommitMessages(frontmatter: Frontmatter): Frontmatter {
  const updatedFrontmatter = { ...frontmatter };

  if (updatedFrontmatter.commits && Array.isArray(updatedFrontmatter.commits)) {
    updatedFrontmatter.commits = updatedFrontmatter.commits.map(commit => {
      // Try to fetch the actual commit message from git
      const fetchedMessage = getCommitMessage(commit.sha);
      if (fetchedMessage) {
        return {
          ...commit,
          message: fetchedMessage,
        };
      } else {
        // Remove message field if no commit found
        const { message: _, ...commitWithoutMessage } = commit;
        return commitWithoutMessage;
      }
    });
  }

  return updatedFrontmatter;
}
