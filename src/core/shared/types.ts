export interface IdProvider {
  generateId(): string;
}

export interface FileInfo {
  id: string;
  type: string;
  filePath: string;
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
