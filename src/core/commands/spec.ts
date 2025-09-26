import { FileInfo } from '../shared/types';
import { getFileTypeLabel, getFileTypeDescription } from '../shared/file-types';
import { recordCommitsToFile } from '../shared/commit-recorder';

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
          `Error: Spec commits have to be added to spec files. The file you entered, ${getFileTypeLabel(fileInfo.type)} ${fileInfo.id} at ${fileInfo.filePath.substring(1)}, is a ${typeDescription} file.`
        );
      }

      // Check if the file is in the spec-history directory relative to configured docs directory
      const normalizedPath = fileInfo.filePath.replace(/^\/+/, '');
      if (!normalizedPath.startsWith('spec-history/')) {
        throw new Error(
          `Error: Spec commit recording only applies to files in spec-history/. The file you entered, ${getFileTypeLabel(fileInfo.type)} ${fileInfo.id} at ${fileInfo.filePath.substring(1)}, is not in the spec-history directory.`
        );
      }
    },
  });
}
