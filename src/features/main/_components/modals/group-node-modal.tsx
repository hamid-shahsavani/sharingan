import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  type GroupNodeFormValues,
  groupNodeSchema,
} from '@/features/main/_schemas/group-node-schema';
import { Button } from '@/features/shared/_uis/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/_uis/dialog';
import { Input } from '@/features/shared/_uis/input';
import { Label } from '@/features/shared/_uis/label';

export interface GroupNodeModalProps {
  isOpen: boolean;
  nodeId: string | null;
  initialTitle?: string;
  onClose: () => void;
  onSubmit: (values: GroupNodeFormValues, nodeId: string | null) => Promise<void> | void;
}

export const GroupNodeModal = (props: GroupNodeModalProps) => {
  const isEditMode = Boolean(props.nodeId);

  const form = useForm<GroupNodeFormValues>({
    resolver: zodResolver(groupNodeSchema),
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-node-title" isRequired>
              عنوان
            </Label>
            <Input
              id="group-node-title"
              isInvalid={Boolean(form.formState.errors.title)}
              {...form.register('title')}
            />
            {form.formState.errors.title?.message ? (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-[50px] w-full cursor-pointer rounded-xl border border-white/10 bg-[oklch(0.52_0.20_300)] text-sm font-semibold text-white shadow-md shadow-purple-950/40 transition-colors duration-300 ease-out hover:border-white/20 hover:bg-[oklch(0.60_0.22_300)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              {isEditMode ? 'ثبت تغییرات' : 'ایجاد'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
