export function getFileTypeLabel(type: string): string {
  switch (type) {
    case 'spec':
      return 'Spec';
    case 'test':
      return 'Test';
    case 'implementation':
      return 'Impl';
    case 'ref-impl':
      return 'Ref Impl';
    case 'project':
      return 'Proj';
    default:
      return 'File';
  }
}

export function getFileTypeDescription(type: string): string {
  switch (type) {
    case 'spec':
      return 'specification';
    case 'test':
      return 'test';
    case 'implementation':
      return 'implementation';
    case 'ref-impl':
      return 'reference implementation';
    case 'project':
      return 'project';
    default:
      return 'unknown';
  }
}
