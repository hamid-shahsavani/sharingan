import type { VersionRecord } from '@/features/shared/_utils/database';

export type CreateToolbarAction = 'group';

export interface VersionControlMenuProps {
  activeVersionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  onDeleteVersion: (versionId: string) => void;
  onDownloadVersion: (versionId: string) => void;
  onSave: () => void;
  onSwitchVersion: (versionId: string) => void;
  versions: VersionRecord[];
  isEmbedded?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}
