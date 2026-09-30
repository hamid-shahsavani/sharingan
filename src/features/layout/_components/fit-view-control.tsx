import { useReactFlow } from '@xyflow/react';
import { Maximize2 } from 'lucide-react';

import { Button } from '@/features/shared/_uis/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';

export interface FitViewControlProps {
  onFitView?: () => void;
}

export const FitViewControl = (props: FitViewControlProps) => {
  const { fitView } = useReactFlow();

  const handleFitView = () => {
    if (props.onFitView) {
      props.onFitView();
    } else {
      void fitView({ padding: 0.18, duration: 450 });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block" />}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="نمایش همه نودها"
          onClick={handleFitView}
          className="size-11! rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 p-0 text-node-text shadow-sm backdrop-blur-xl transition-all duration-200 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:text-accent-purple active:scale-95"
        >
          <Maximize2 className="size-5" strokeWidth={1.8} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">نمایش همه نودها</TooltipContent>
    </Tooltip>
  );
};

