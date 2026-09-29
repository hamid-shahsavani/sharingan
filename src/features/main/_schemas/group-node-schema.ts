import { z } from 'zod';

export const groupNodeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'عنوان الزامی است.')
    .max(100, 'عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.'),
});

export type GroupNodeFormValues = z.infer<typeof groupNodeSchema>;
