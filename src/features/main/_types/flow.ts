export interface NodeVisualBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ParentSectionNodeData extends Record<string, unknown> {
  isHovered?: boolean;
}
