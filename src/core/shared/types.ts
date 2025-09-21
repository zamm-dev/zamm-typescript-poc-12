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

export interface Frontmatter {
  id?: string;
  type?: string;
  [key: string]: unknown;
}
