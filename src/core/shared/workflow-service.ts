import * as fs from 'fs';
import * as path from 'path';
import { CurrentWorkflowState, WorkflowState } from './types.js';

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

export class WorkflowStateService extends WorkflowService {
  private static readonly CURRENT_WORKFLOW_STATE_FILE =
    'current-workflow-state.json';

  static async initialize(directoryPath: string): Promise<void> {
    await this.ensureZammDirectory(directoryPath);

    // Initialize or reset current-workflow-state.json to INITIAL state
    const currentStatePath = path.join(
      directoryPath,
      this.ZAMM_DIR,
      this.CURRENT_WORKFLOW_STATE_FILE
    );
    const initialState: CurrentWorkflowState = { state: 'INITIAL' };
    await fs.promises.writeFile(
      currentStatePath,
      JSON.stringify(initialState, null, 2) + '\n'
    );
  }

  static async updateState(
    directoryPath: string,
    newState: WorkflowState
  ): Promise<void> {
    const currentStatePath = path.join(
      directoryPath,
      this.ZAMM_DIR,
      this.CURRENT_WORKFLOW_STATE_FILE
    );

    const state: CurrentWorkflowState = { state: newState };
    await fs.promises.writeFile(
      currentStatePath,
      JSON.stringify(state, null, 2) + '\n'
    );
  }

  static async getCurrentState(
    directoryPath: string
  ): Promise<CurrentWorkflowState | null> {
    const currentStatePath = path.join(
      directoryPath,
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
