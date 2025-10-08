import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { findGitRoot } from '../shared/file-utils';
import { WorkflowStateService } from '../shared/workflow-service';

export interface FeatStartOptions {
  description: string;
}

function resolveScriptPath(gitRoot: string): string {
  const override = process.env.ZAMM_FEAT_START_SCRIPT;
  if (override && override.trim().length > 0) {
    return path.isAbsolute(override) ? override : path.join(gitRoot, override);
  }

  return path.join(gitRoot, 'dev', 'start-worktree.sh');
}

async function runFeatScript(
  gitRoot: string,
  description: string
): Promise<string | null> {
  const scriptPath = resolveScriptPath(gitRoot);

  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `Missing feature start script at ${path.relative(gitRoot, scriptPath)}`
    );
  }

  return await new Promise<string | null>((resolve, reject) => {
    const child = spawn(scriptPath, [description], {
      cwd: gitRoot,
      stdio: ['inherit', 'pipe', 'inherit'],
      env: process.env as Record<string, string>,
    });

    let stdoutContent = '';

    child.stdout?.on('data', (data: Buffer) => {
      process.stdout.write(data);
      stdoutContent += data.toString();
    });

    child.on('error', error => {
      reject(error);
    });

    child.on('close', code => {
      const overrideMatch = stdoutContent.match(
        /^\s*ZAMM_INIT_DIR_OVERRIDE=(.+)$/m
      );
      const override =
        overrideMatch && typeof overrideMatch[1] === 'string'
          ? overrideMatch[1].trim()
          : null;
      if (code === 0) {
        resolve(override);
      } else {
        reject(
          new Error(
            `${path.relative(gitRoot, scriptPath)} exited with code ${code}`
          )
        );
      }
    });
  });
}

export async function featStart(options: FeatStartOptions): Promise<void> {
  const gitRoot = findGitRoot(process.cwd());
  if (!gitRoot) {
    throw new Error('Not in a git repository');
  }

  const override = await runFeatScript(gitRoot, options.description);

  const workflowRoot = override
    ? path.isAbsolute(override)
      ? override
      : path.resolve(gitRoot, override)
    : gitRoot;

  await WorkflowStateService.initialize(workflowRoot);
}
