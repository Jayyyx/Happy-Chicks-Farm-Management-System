
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  item_sold: z.string().min(1, 'Item sold is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.coerce.number().min(0, 'Unit price cannot be negative'),
  total_price: z.coerce.number().min(0, 'Total price cannot be negative'),
  customer_name: z.string().optional(),
  recorded_by: z.string().min(1, 'Recorded by is required'),
});

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

export async function addSale(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication error.', success: false };
  
  const validatedFields = formSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { error } = await supabase.from('sales').insert({
    ...validatedFields.data,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Failed to save record: ${error.message}`, success: false };
  }

  revalidatePath('/sales');
  return { message: 'Successfully recorded sale.', success: true };
}


export async function deleteSale(id: string): Promise<{ message: string; success: boolean; }> {
  const supabase = createClient();
  const { error } = await supabase.from('sales').delete().match({ id });

  if (error) {
    console.error('Supabase delete error:', error);
    return { message: `Failed to delete sale: ${error.message}`, success: false };
  }

  revalidatePath('/sales');
  return { message: 'Successfully deleted sale.', success: true };
}
