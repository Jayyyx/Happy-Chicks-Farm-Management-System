
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  shed: z.string().min(1, 'Shed is required'),
  count: z.coerce.number().int().min(1, 'Count must be at least 1'),
  recorded_by: z.string().min(1, 'Recorded by is required'),
  cause: z.string().optional(),
});

const updateFormSchema = formSchema.extend({
  id: z.string().uuid("Invalid record ID"),
});


export type FormState = {
  message: string;
  errors?: {
    id?: string[];
    date?: string[];
    shed?: string[];
    count?: string[];
    recorded_by?: string[];
    cause?: string[];
  };
  success?: boolean;
};

export async function addMortalityRecord(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: 'Authentication error: User not found.',
      success: false,
    };
  }

  const validatedFields = formSchema.safeParse({
    date: formData.get('mortalityDate'),
    shed: formData.get('shed'),
    count: formData.get('count'),
    recorded_by: formData.get('recordedBy'),
    cause: formData.get('cause'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { date, shed, count, recorded_by, cause } = validatedFields.data;

  const { error } = await supabase.from('mortality_records').insert({
    date,
    shed,
    count,
    cause,
    recorded_by,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase error:', error);
    return {
      message: `Failed to save record: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/mortality');

  return {
    message: 'Successfully logged mortality record.',
    success: true,
  };
}


export async function updateMortalityRecord(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();

  const validatedFields = updateFormSchema.safeParse({
    id: formData.get('id'),
    date: formData.get('mortalityDate'),
    shed: formData.get('shed'),
    count: formData.get('count'),
    recorded_by: formData.get('recordedBy'),
    cause: formData.get('cause'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { id, date, shed, count, cause, recorded_by } = validatedFields.data;

  const { error } = await supabase
    .from('mortality_records')
    .update({ date, shed, count, cause, recorded_by })
    .match({ id });

  if (error) {
    console.error('Supabase update error:', error);
    return {
      message: `Failed to update record: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/mortality');

  return {
    message: 'Successfully updated mortality record.',
    success: true,
  };
}


export async function deleteMortalityRecord(id: string): Promise<{ message: string; success: boolean; }> {
  const supabase = createClient();
  const { error } = await supabase.from('mortality_records').delete().match({ id });

  if (error) {
    console.error('Supabase delete error:', error);
    return { message: `Failed to delete record: ${error.message}`, success: false };
  }

  revalidatePath('/mortality');
  return { message: 'Successfully deleted mortality record.', success: true };
}
