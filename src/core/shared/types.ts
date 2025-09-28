export interface IdProvider {
  generateId(): string;
}

export interface FileInfo {
  id: string;
  type: string;
  filePath: string; // Path relative to docs directory (for internal storage)
  displayPath: string; // Path relative to current directory (for user output)
  absolutePath: string;
  gitRoot: string;
}

export interface Implementation {
  id: string;
  name: string;
}

export interface ImplementOptions {
  specIdOrPath: string;
  implIdOrPath: string;
}

export interface FileReference {
  id: string;
  path?: string;
}

export interface Frontmatter {
  id?: string;
  type?: string;
  commits?: Commit[];
  specs?: FileReference[];
  impl?: FileReference;
  [key: string]: unknown;
}

export interface Commit {
  sha: string;
  message?: string;
}

export type WorkflowState =
  | 'INITIAL'
  | 'SPEC-UPDATED'
  | 'SPEC-IMPLEMENTED'
  | 'COMPLETED';

export interface WorktreeInfo {
  branch: string;
  path: string;
  state: WorkflowState;
}

export interface BaseState {
  worktrees: Record<string, WorktreeInfo>;
}

export interface RedirectConfig {
  directory: string;
}

export interface CurrentWorkflowState {
  state: WorkflowState;
}
