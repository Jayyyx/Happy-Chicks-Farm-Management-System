
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

export type FormState = {
  message: string;
  errors?: {
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
