
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
});

const updateFormSchema = formSchema.extend({
  id: z.string().uuid("Invalid record ID"),
});


export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

async function getCurrentUserFullName() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'System';

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
    
    return profile?.full_name ?? user.email ?? 'System';
}

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
  
  const recorded_by = await getCurrentUserFullName();

  const { error } = await supabase.from('sales').insert({
    ...validatedFields.data,
    recorded_by,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Failed to save record: ${error.message}`, success: false };
  }

  revalidatePath('/sales');
  return { message: 'Successfully recorded sale.', success: true };
}

export async function updateSale(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const validatedFields = updateFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const recorded_by = await getCurrentUserFullName();
  const { id, ...saleData } = validatedFields.data;

  const { error } = await supabase
    .from('sales')
    .update({ ...saleData, recorded_by })
    .match({ id });

  if (error) {
    console.error('Supabase update error:', error);
    return {
      message: `Failed to update record: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/sales');
  return {
    message: 'Successfully updated sale record.',
    success: true,
  };
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
