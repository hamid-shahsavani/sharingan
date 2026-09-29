import { cn } from 'cn';
import {
  CheckCircle2,
  Clock3,
  Download,
  History,
  Save,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/features/shared/_uis/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/_uis/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/_uis/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/features/shared/_uis/tooltip';
import type { VersionRecord } from '@/features/shared/_utils/database';

export interface VersionControlProps {
  activeVersionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  onDeleteVersion: (versionId: string) => void;
  onDownloadVersion: (versionId: string) => void;
  onSaveVersion: () => void;
  onSwitchVersion: (versionId: string) => void;
  versions: VersionRecord[];
  onOpenChange?: (isOpen: boolean) => void;
  anchorRef?: React.RefObject<Element | null>;
}

interface VersionControlSectionProps {
  activeVersionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  onDelete: (versionId: string) => void;
  onDownload: (versionId: string) => void;
  onSave: () => void;
  onSwitch: (versionId: string) => void;
  versions: VersionRecord[];
}

function formatVersionDate(timestampNumber: number): string {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestampNumber));
}

const VersionControlSection = (props: VersionControlSectionProps) => {
  return (
    <section className="px-2 pt-1 pb-2 text-right">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <span className="flex-1 text-xs font-medium">کنترل نسخه</span>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            props.isDirty ? 'text-amber-500' : 'text-emerald-500',
          )}
        >
          {props.isDirty ? (
            <Clock3 className="size-3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          <span>{props.isDirty ? 'تغییرات ذخیره‌نشده' : 'نسخه فعلی'}</span>
        </div>
      </div>

      <Select
        value={props.activeVersionId ?? undefined}
        onValueChange={(versionId) => {
          if (versionId) {
            props.onSwitch(versionId);
          }
        }}
      >
        <SelectTrigger aria-label="نسخه‌ها">
          <SelectValue placeholder="انتخاب نسخه..." />
        </SelectTrigger>

        <SelectContent align="center" side="top">
          {props.versions.map((version, index) => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex flex-col gap-0.5 text-right">
                <span className="text-sm font-medium">
                  {version.name || `نسخه ${props.versions.length - index}`}
                  {index === 0 ? (
                    <span className="mr-1 text-xs text-muted-foreground">
                      · نسخه فعلی
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatVersionDate(version.createdAt)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-block" />}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="حذف نسخه"
                disabled={!props.activeVersionId || props.versions.length <= 1}
                onClick={() => {
                  if (props.activeVersionId) {
                    props.onDelete(props.activeVersionId);
                  }
                }}
                className="size-8 rounded-md border border-destructive/25 bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {props.versions.length > 1 ? 'حذف نسخه' : 'نسخه فعلی'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={<span className="inline-block" />}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="دانلود نسخه"
                disabled={!props.activeVersionId}
                onClick={() => {
                  if (props.activeVersionId) {
                    props.onDownload(props.activeVersionId);
                  }
                }}
                className="size-8 rounded-md border-border/60 text-muted-foreground shadow-none hover:text-foreground"
              >
                <Download className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              دانلود نسخه
            </TooltipContent>
          </Tooltip>

          <Button
            type="button"
            size="sm"
            disabled={!props.isDirty || props.isSaving}
            onClick={props.onSave}
            className="h-8 flex-1 gap-1.5 rounded-lg text-xs font-medium shadow-none"
          >
            <Save className="size-3.5" />
            {props.isSaving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </TooltipProvider>
    </section>
  );
};

export const VersionControl = (props: VersionControlProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    props.onOpenChange?.(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="کنترل نسخه"
                  className="size-10! rounded-xl border border-node-border/60 bg-linear-to-b from-node-surface-from/70 to-node-surface-to/90 p-0 text-node-text shadow-sm backdrop-blur-xl transition-all duration-200 hover:from-node-surface-hover-from hover:to-node-surface-hover-to hover:text-accent-purple aria-expanded:from-node-surface-hover-from aria-expanded:to-node-surface-hover-to aria-expanded:text-accent-purple active:scale-95"
                />
              }
            />
          }
        >
          <History size={16} strokeWidth={1.5} />
        </TooltipTrigger>
        <TooltipContent side="top">کنترل نسخه</TooltipContent>
      </Tooltip>
      <PopoverContent
        anchor={props.anchorRef}
        side="top"
        sideOffset={14}
        align="center"
        className="max-h-[calc(100vh-1rem)] w-[290px] overflow-visible rounded-xl border border-node-border bg-linear-to-b from-node-surface-from/95 to-node-surface-to/98 p-1.5 text-node-text shadow-[0_18px_55px_var(--node-shadow)] backdrop-blur-2xl ring-1 ring-white/10"
      >
        <VersionControlSection
          activeVersionId={props.activeVersionId}
          isDirty={props.isDirty}
          isSaving={props.isSaving}
          onDelete={props.onDeleteVersion}
          onDownload={props.onDownloadVersion}
          onSave={props.onSaveVersion}
          onSwitch={props.onSwitchVersion}
          versions={props.versions}
        />
      </PopoverContent>
    </Popover>
  );
};
