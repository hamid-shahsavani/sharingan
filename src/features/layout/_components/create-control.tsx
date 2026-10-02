import { FilePlus2 } from 'lucide-react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface CreateControlProps {
  onOpenCreateModal?: () => void;
  onOpenCreateGroupModal?: () => void;
}

export const CreateControl = (props: CreateControlProps) => {
  const handleOpen = props.onOpenCreateModal ?? props.onOpenCreateGroupModal;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="ایجاد نود"
            onClick={handleOpen}
            className="size-11! cursor-pointer rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 text-node-text shadow-sm backdrop-blur-xl transition-all duration-200 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:text-accent-purple active:scale-95"
          >
            <FilePlus2 className="size-5" strokeWidth={1.8} />
          </Button>
        }
      />
      <TooltipContent side="top">ایجاد نود</TooltipContent>
    </Tooltip>
  );
};
