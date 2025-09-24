import * as fs from 'fs';
import * as path from 'path';
import {
  BaseState,
  CurrentWorkflowState,
  WorkflowState,
  WorktreeInfo,
} from './types.js';

abstract class WorkflowService {
  protected static readonly ZAMM_DIR = '.zamm';
  protected static readonly GITIGNORE_CONTENT = '*\n';

  protected static async ensureZammDirectory(
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
}

export class BaseWorkflowService extends WorkflowService {
  private static readonly BASE_STATE_FILE = 'base-state.json';

  static async initialize(gitRoot: string): Promise<void> {
    await this.ensureZammDirectory(gitRoot);

    // Initialize base-state.json if it doesn't exist
    const baseStatePath = path.join(
      gitRoot,
      this.ZAMM_DIR,
      this.BASE_STATE_FILE
    );
    if (!fs.existsSync(baseStatePath)) {
      const initialState: BaseState = { worktrees: {} };
      await fs.promises.writeFile(
        baseStatePath,
        JSON.stringify(initialState, null, 2)
      );
    }
  }

  static async addWorktree(
    gitRoot: string,
    branch: string,
    worktreePath: string
  ): Promise<void> {
    const baseStatePath = path.join(
      gitRoot,
      this.ZAMM_DIR,
      this.BASE_STATE_FILE
    );

    let baseState: BaseState;
    try {
      const content = await fs.promises.readFile(baseStatePath, 'utf-8');
      baseState = JSON.parse(content) as BaseState;
    } catch (error) {
      throw new Error(
        `Failed to read base state: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    const worktreeInfo: WorktreeInfo = {
      branch,
      path: fs.realpathSync(worktreePath), // Resolve symlinks for consistent paths
      state: 'INITIAL',
    };

    baseState.worktrees[branch] = worktreeInfo;

    await fs.promises.writeFile(
      baseStatePath,
      JSON.stringify(baseState, null, 2)
    );
  }

  static async updateWorktreeState(
    gitRoot: string,
    branch: string,
    newState: WorkflowState
  ): Promise<void> {
    const baseStatePath = path.join(
      gitRoot,
      this.ZAMM_DIR,
      this.BASE_STATE_FILE
    );

    let baseState: BaseState;
    try {
      const content = await fs.promises.readFile(baseStatePath, 'utf-8');
      baseState = JSON.parse(content) as BaseState;
    } catch (error) {
      throw new Error(
        `Failed to read base state: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (baseState.worktrees[branch]) {
      baseState.worktrees[branch].state = newState;
      await fs.promises.writeFile(
        baseStatePath,
        JSON.stringify(baseState, null, 2)
      );
    }
  }

  static async getBaseState(gitRoot: string): Promise<BaseState | null> {
    const baseStatePath = path.join(
      gitRoot,
      this.ZAMM_DIR,
      this.BASE_STATE_FILE
    );

    try {
      const content = await fs.promises.readFile(baseStatePath, 'utf-8');
      return JSON.parse(content) as BaseState;
    } catch {
      return null;
    }
  }
}

export class WorktreeWorkflowService extends WorkflowService {
  private static readonly CURRENT_WORKFLOW_STATE_FILE =
    'current-workflow-state.json';

  static async initialize(worktreePath: string): Promise<void> {
    await this.ensureZammDirectory(worktreePath);

    // Initialize current-workflow-state.json
    const currentStatePath = path.join(
      worktreePath,
      this.ZAMM_DIR,
      this.CURRENT_WORKFLOW_STATE_FILE
    );
    const initialState: CurrentWorkflowState = { state: 'INITIAL' };
    await fs.promises.writeFile(
      currentStatePath,
      JSON.stringify(initialState, null, 2)
    );
  }

  static async updateState(
    worktreePath: string,
    newState: WorkflowState
  ): Promise<void> {
    const currentStatePath = path.join(
      worktreePath,
      this.ZAMM_DIR,
      this.CURRENT_WORKFLOW_STATE_FILE
    );

    const state: CurrentWorkflowState = { state: newState };
    await fs.promises.writeFile(
      currentStatePath,
      JSON.stringify(state, null, 2)
    );
  }

  static async getCurrentState(
    worktreePath: string
  ): Promise<CurrentWorkflowState | null> {
    const currentStatePath = path.join(
      worktreePath,
      this.ZAMM_DIR,
      this.CURRENT_WORKFLOW_STATE_FILE
    );

    try {
      const content = await fs.promises.readFile(currentStatePath, 'utf-8');
      return JSON.parse(content) as CurrentWorkflowState;
    } catch {
      return null;
    }
  }
}
