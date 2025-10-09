import * as fs from 'fs';
import * as path from 'path';
import { FileInfo } from '../shared/types';
import { getFileTypeLabel, getFileTypeDescription } from '../shared/file-types';
import { recordCommitsToFile } from '../shared/commit-recorder';
import { getDocsDirectory } from '../shared/file-utils';
import { getIdProvider } from '../shared/id-provider';
import { serializeFrontmatter } from '../shared/frontmatter';
import { getAnthropicService } from '../shared/anthropic-service';

export async function recordSpecCommits(
  idOrPath: string,
  lastNCommits: number
): Promise<void> {
  await recordCommitsToFile(idOrPath, lastNCommits, {
    validateFile: (fileInfo: FileInfo) => {
      // Validate that the file is a spec and in the spec-history directory
      if (fileInfo.type !== 'spec') {
        const typeDescription = getFileTypeDescription(fileInfo.type);
        throw new Error(
          `Error: Spec commits have to be added to spec files. The file you entered, ${getFileTypeLabel(fileInfo.type)} ${fileInfo.id} at ${fileInfo.displayPath}, is a ${typeDescription} file.`
        );
      }

      // Check if the file is in the spec-history directory relative to configured docs directory
      const normalizedPath = fileInfo.filePath.replace(/^\/+/, '');
      if (!normalizedPath.startsWith('spec-history/')) {
        throw new Error(
          `Error: Spec commit recording only applies to files in docs/spec-history/. The file you entered, ${getFileTypeLabel(fileInfo.type)} ${fileInfo.id} at ${fileInfo.displayPath}, is not in the spec-history directory.`
        );
      }
    },
  });
}

export interface CreateSpecChangelogOptions {
  filepath: string;
  description?: string;
  title?: string;
}

export async function createSpecChangelog(
  options: CreateSpecChangelogOptions | string
): Promise<string> {
  // Handle both old string API and new options API
  const filepath = typeof options === 'string' ? options : options.filepath;
  const description =
    typeof options === 'object' ? options.description : undefined;
  const title = typeof options === 'object' ? options.title : undefined;

  // Normalize the filepath to ensure it starts with spec-history/
  let normalizedPath = filepath;
  if (!normalizedPath.startsWith('spec-history/')) {
    normalizedPath = `spec-history/${normalizedPath}`;
  }

  // Ensure the file has .md extension
  if (!normalizedPath.endsWith('.md')) {
    normalizedPath += '.md';
  }

  // Get the docs directory and construct the full file path
  const docsDir = await getDocsDirectory();
  const fullFilePath = path.join(docsDir, normalizedPath);

  // Check if file already exists
  if (fs.existsSync(fullFilePath)) {
    throw new Error(`File already exists: ${normalizedPath}`);
  }

  // Ensure the target directory exists
  const dirPath = path.dirname(fullFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Generate a new ID for the spec
  const idProvider = getIdProvider();
  const id = idProvider.generateId();

  // Create frontmatter
  const frontmatter = {
    id,
    type: 'spec' as const,
  };

  // Create body based on provided options
  let body = '';

  if (description || title) {
    let actualTitle = title;

    // If description is provided but not title, auto-generate the title
    if (description && !title) {
      const anthropicService = getAnthropicService();
      actualTitle = await anthropicService.suggestSpecTitle(description);
    }

    // Build the body with title and description
    if (actualTitle) {
      body = `# ${actualTitle}\n\n`;
    }
    if (description) {
      body += description;
    }
  }

  // Serialize the complete file content
  const fileContent = serializeFrontmatter(frontmatter, body);

  // Write the file
  fs.writeFileSync(fullFilePath, fileContent, 'utf8');

  return fullFilePath;
}
