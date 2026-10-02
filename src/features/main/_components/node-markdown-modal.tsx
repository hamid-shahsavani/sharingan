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
import { Label } from '@/features/shared/_uis/label';
import { Textarea } from '@/features/shared/_uis/textarea';

const nodeMarkdownSchema = z.object({
  header: z
    .string()
    .trim()
    .max(100, 'عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.')
    .optional()
    .or(z.literal('')),
  body: z.string().trim().min(1, 'محتوا الزامی است.'),
  footer: z
    .string()
    .trim()
    .max(100, 'پابرگ نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.')
    .optional()
    .or(z.literal('')),
});

export type NodeMarkdownFormValues = z.infer<typeof nodeMarkdownSchema>;

export interface NodeMarkdownInitialData {
  header?: string;
  body?: string;
  footer?: string;
}

export interface NodeMarkdownModalProps {
  isOpen: boolean;
  nodeId: string | null;
  initialHeader?: string;
  initialBody?: string;
  initialFooter?: string;
  initialData?: NodeMarkdownInitialData;
  onClose: () => void;
  onSubmit: (
    values: NodeMarkdownFormValues,
    nodeId: string | null,
  ) => Promise<void> | void;
}

export const NodeMarkdownModal = (props: NodeMarkdownModalProps) => {
  const isEditMode = Boolean(props.nodeId);

  const initialHeader = props.initialHeader ?? props.initialData?.header ?? '';
  const initialBody = props.initialBody ?? props.initialData?.body ?? '';
  const initialFooter = props.initialFooter ?? props.initialData?.footer ?? '';

  const form = useForm<NodeMarkdownFormValues>({
    resolver: zodResolver(nodeMarkdownSchema),
    defaultValues: {
      header: initialHeader,
      body: initialBody,
      footer: initialFooter,
    },
  });

  useEffect(() => {
    if (props.isOpen) {
      form.reset({
        header: initialHeader,
        body: initialBody,
        footer: initialFooter,
      });
    } else {
      form.reset({
        header: '',
        body: '',
        footer: '',
      });
    }
  }, [form, initialHeader, initialBody, initialFooter, props.isOpen]);

  const handleFormSubmit = form.handleSubmit(
    async (values) => {
      await props.onSubmit(values, props.nodeId);
      props.onClose();
    },
    (errors) => {
      console.warn('NodeMarkdown form validation errors:', errors);
    },
  );

  const modalTitle = isEditMode
    ? 'ویرایش نود مارک‌داون'
    : 'ایجاد نود مارک‌داون';

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
            id="node-markdown-header"
            label="عنوان"
            error={form.formState.errors.header?.message}
            {...form.register('header')}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="node-markdown-body" isRequired>
              محتوا
            </Label>
            <Textarea
              id="node-markdown-body"
              rows={4}
              isInvalid={Boolean(form.formState.errors.body)}
              className="resize-y"
              {...form.register('body')}
            />
            {form.formState.errors.body?.message ? (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.body.message}
              </p>
            ) : null}
          </div>

          <Input
            id="node-markdown-footer"
            label="پابرگ"
            error={form.formState.errors.footer?.message}
            {...form.register('footer')}
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
