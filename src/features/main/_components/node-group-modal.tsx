import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/features/shared/_uis/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/_uis/dialog';
import { Input } from '@/features/shared/_uis/input';

const nodeGroupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'عنوان الزامی است.')
    .max(100, 'عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.'),
});

export type NodeGroupFormValues = z.infer<typeof nodeGroupSchema>;

export interface NodeGroupModalProps {
  isOpen: boolean;
  nodeId: string | null;
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (values: NodeGroupFormValues, nodeId: string | null) => Promise<void> | void;
}

export const NodeGroupModal = (props: NodeGroupModalProps) => {
  const isEditMode = Boolean(props.nodeId);

  const form = useForm<NodeGroupFormValues>({
    resolver: zodResolver(nodeGroupSchema),
    defaultValues: {
      title: props.initialTitle ?? '',
    },
  });

  useEffect(() => {
    if (props.isOpen) {
      form.reset({
        title: props.initialTitle ?? '',
      });
    } else {
      form.reset({
        title: '',
      });
    }
  }, [form, props.initialTitle, props.isOpen]);

  const handleFormSubmit = form.handleSubmit(async (values) => {
    await props.onSubmit(values, props.nodeId);
    props.onClose();
  });

  const modalTitle = isEditMode ? 'ویرایش نود گروه' : 'ایجاد نود گروه';

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
    >
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            void handleFormSubmit(event);
          }}
          className="flex flex-col gap-3 pt-1"
        >
          <Input
            id="node-group-title"
            label="عنوان"
            isRequired
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12.5 w-full cursor-pointer rounded-xl border border-white/10 bg-[oklch(0.52_0.20_300)] text-sm font-semibold text-white shadow-md shadow-purple-950/40 transition-colors duration-300 ease-out hover:border-white/20 hover:bg-[oklch(0.60_0.22_300)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              {isEditMode ? 'ثبت تغییرات' : 'ایجاد'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
