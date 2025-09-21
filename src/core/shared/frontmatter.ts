import * as yaml from 'js-yaml';
import { Frontmatter } from './types';

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
