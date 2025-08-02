
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  shed: z.string().min(1, 'Shed is required'),
  total_eggs: z.coerce.number().int().min(0, 'Total eggs cannot be negative'),
  broken_eggs: z.coerce.number().int().min(0, 'Broken eggs cannot be negative'),
  collected_by: z.string().min(1, 'Collected by is required'),
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
    total_eggs?: string[];
    broken_eggs?: string[];
    collected_by?: string[];
  };
  success?: boolean;
};

export async function addEggCollection(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
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
    date: formData.get('collectionDate'),
    shed: formData.get('shed'),
    total_eggs: formData.get('totalEggs'),
    broken_eggs: formData.get('brokenEggs'),
    collected_by: formData.get('collectedBy'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { date, shed, total_eggs, broken_eggs, collected_by } = validatedFields.data;

  const { error } = await supabase.from('egg_collections').insert({
    date,
    shed,
    total_eggs,
    broken_eggs,
    collected_by,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase error:', error);
    return {
      message: `Failed to save record: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/egg-collection');

  return {
    message: 'Successfully saved egg collection record.',
    success: true,
  };
}

export async function updateEggCollection(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();

  const validatedFields = updateFormSchema.safeParse({
    id: formData.get('id'),
    date: formData.get('collectionDate'),
    shed: formData.get('shed'),
    total_eggs: formData.get('totalEggs'),
    broken_eggs: formData.get('brokenEggs'),
    collected_by: formData.get('collectedBy'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { id, date, shed, total_eggs, broken_eggs, collected_by } = validatedFields.data;

  const { error } = await supabase
    .from('egg_collections')
    .update({ date, shed, total_eggs, broken_eggs, collected_by })
    .match({ id });

  if (error) {
    console.error('Supabase update error:', error);
    return {
      message: `Failed to update record: ${error.message}`,
      success: false,
    };
  }

  revalidatePath('/egg-collection');

  return {
    message: 'Successfully updated egg collection record.',
    success: true,
  };
}


export async function deleteEggCollection(id: string): Promise<{ message: string; success: boolean; }> {
  const supabase = createClient();
  const { error } = await supabase.from('egg_collections').delete().match({ id });

  if (error) {
    console.error('Supabase delete error:', error);
    return { message: `Failed to delete record: ${error.message}`, success: false };
  }

  revalidatePath('/egg-collection');
  return { message: 'Successfully deleted egg collection record.', success: true };
}
