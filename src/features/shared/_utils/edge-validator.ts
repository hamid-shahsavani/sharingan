export interface EdgeHandleCheck {
  type?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export function isParentChildEdge(edge: EdgeHandleCheck): boolean {
  if (edge.type === 'relation') {
    return false;
  }

  if (
    edge.sourceHandle?.startsWith('relation-') ||
    edge.targetHandle?.startsWith('relation-')
  ) {
    return false;
  }

  if (
    edge.sourceHandle &&
    edge.sourceHandle !== 'parent-source' &&
    edge.targetHandle &&
    edge.targetHandle !== 'parent-target'
  ) {
    return false;
  }

  return true;
}
