import * as fs from 'fs';
import * as path from 'path';
import { RedirectConfig } from './types.js';

export class RedirectService {
  private static readonly ZAMM_DIR = '.zamm';
  private static readonly REDIRECT_FILE = 'redirect.json';
  private static readonly GITIGNORE_CONTENT = '*\n';

  private static async ensureZammDirectory(
    directoryPath: string
  ): Promise<void> {
    const zammDir = path.join(directoryPath, this.ZAMM_DIR);

    // Ensure .zamm directory exists
    await fs.promises.mkdir(zammDir, { recursive: true });

    // Create .gitignore file to ignore all contents
    const gitignorePath = path.join(zammDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      await fs.promises.writeFile(gitignorePath, this.GITIGNORE_CONTENT);
    }
  }

  static async setRedirectDirectory(
    gitRoot: string,
    redirectDir: string
  ): Promise<void> {
    await this.ensureZammDirectory(gitRoot);

    // Resolve to absolute path for consistency
    const absoluteRedirectDir = path.resolve(redirectDir);

    // Validate that directory exists
    if (!fs.existsSync(absoluteRedirectDir)) {
      throw new Error(`Directory does not exist: ${redirectDir}`);
    }

    // Check if directory is accessible
    try {
      await fs.promises.access(
        absoluteRedirectDir,
        fs.constants.R_OK | fs.constants.W_OK
      );
    } catch {
      throw new Error(`Directory is not accessible: ${redirectDir}`);
    }

    const redirectPath = path.join(gitRoot, this.ZAMM_DIR, this.REDIRECT_FILE);

    const redirectConfig: RedirectConfig = {
      directory: absoluteRedirectDir,
    };

    await fs.promises.writeFile(
      redirectPath,
      JSON.stringify(redirectConfig, null, 2) + '\n'
    );
  }

  static async getRedirectDirectory(gitRoot: string): Promise<string | null> {
    const redirectPath = path.join(gitRoot, this.ZAMM_DIR, this.REDIRECT_FILE);

    try {
      const content = await fs.promises.readFile(redirectPath, 'utf-8');
      const config = JSON.parse(content) as RedirectConfig;
      return config.directory;
    } catch {
      return null;
    }
  }
}
