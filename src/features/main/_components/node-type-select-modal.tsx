import { FileText, Layers3 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/_uis/dialog';

export type CreatableNodeType = 'group' | 'markdown';

export interface NodeTypeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: CreatableNodeType) => void;
}

interface NodeTypeOption {
  type: CreatableNodeType;
  title: string;
  icon: typeof Layers3;
}

const NODE_TYPE_OPTIONS: NodeTypeOption[] = [
  {
    type: 'group',
    title: 'گروه',
    icon: Layers3,
  },
  {
    type: 'markdown',
    title: 'مارک‌داون',
    icon: FileText,
  },
];

export const NodeTypeSelectModal = (props: NodeTypeSelectModalProps) => {
  const handleSelect = (type: CreatableNodeType) => {
    props.onSelectType(type);
  };

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    >
      <DialogContent dir="rtl" className="max-w-70 gap-3 p-4">
        <DialogHeader>
          <DialogTitle>انتخاب نوع نود</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 mt-2">
          {NODE_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => handleSelect(option.type)}
                className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-node-border/70 bg-linear-to-b from-node-surface-from/80 to-node-surface-to/90 p-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-purple/60 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:shadow-lg hover:shadow-purple-950/20 active:translate-y-0"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border border-node-border bg-node-icon-background text-node-icon-foreground transition-all duration-200 group-hover:border-accent-purple group-hover:bg-accent-purple/15 group-hover:text-accent-purple">
                  <Icon className="size-5" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-accent-purple">
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
