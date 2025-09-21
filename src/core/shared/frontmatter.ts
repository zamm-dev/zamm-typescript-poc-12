import * as yaml from 'js-yaml';
import { Frontmatter, Commit } from './types';

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
