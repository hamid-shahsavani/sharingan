import { type NodeProps } from '@xyflow/react';
import { cn } from 'cn';

import { type ParentSectionNodeData } from '@/features/main/_types/flow';

export type ParentSectionNodeProps = NodeProps;

export const ParentSectionNode = (props: ParentSectionNodeProps) => {
  const sectionData = props.data as ParentSectionNodeData | undefined;
  const isHovered = Boolean(sectionData?.isHovered);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none box-border size-full rounded-2xl border border-transparent bg-transparent opacity-0 transition-[border-color,background-color,opacity] duration-220 ease-out',
        isHovered &&
          'border-accent-purple bg-[color-mix(in_oklch,var(--accent-purple)_10%,var(--background))] opacity-100',
      )}
    />
  );
};
