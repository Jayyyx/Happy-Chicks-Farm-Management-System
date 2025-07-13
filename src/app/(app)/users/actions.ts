
'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AuthApiError } from '@supabase/supabase-js';

// Helper function to check if the current user is a manager
async function isManager() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !profile) return false;
  return profile.role === 'Manager';
}

const inviteSchema = z.object({
  email: z.string().email("Invalid email address."),
  full_name: z.string().min(1, "Full name is required."),
  role: z.enum(['Manager', 'Worker']),
});

export type InviteFormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

export async function inviteUser(prevState: InviteFormState | undefined, formData: FormData): Promise<InviteFormState> {
  const managerCheck = await isManager();
  if (!managerCheck) {
    return { message: "Permission denied. Only managers can invite users.", success: false };
  }

  const validatedFields = inviteSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, full_name, role } = validatedFields.data;

  // IMPORTANT: Admin actions require the service role key.
  // This key should be in your .env file.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002').origin}/login`
  });

  if (error) {
    console.error('Supabase invite error:', error);
    if (error instanceof AuthApiError && error.message.includes('unique constraint')) {
        return { message: "User with this email already exists.", success: false };
    }
    return { message: `Failed to invite user: ${error.message}`, success: false };
  }

  revalidatePath('/users');
  return { message: 'Successfully sent invitation.', success: true };
}


const updateSchema = z.object({
    id: z.string().uuid("Invalid user ID."),
    full_name: z.string().min(1, "Full name is required."),
    role: z.enum(['Manager', 'Worker']),
    status: z.enum(['Active', 'Inactive']),
});

export type UpdateFormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};


export async function updateUser(prevState: UpdateFormState | undefined, formData: FormData): Promise<UpdateFormState> {
    const managerCheck = await isManager();
    if (!managerCheck) {
        return { message: "Permission denied. Only managers can update users.", success: false };
    }

    const validatedFields = updateSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }
    
    const { id, full_name, role, status } = validatedFields.data;

    const supabase = createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ full_name, role, status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('Supabase update error:', error);
        return { message: `Failed to update user: ${error.message}`, success: false };
    }

    revalidatePath('/users');
    return { message: 'Successfully updated user profile.', success: true };
}


export async function deleteUser(userId: string): Promise<{ message: string; success: boolean; }> {
    const managerCheck = await isManager();
    if (!managerCheck) {
        return { message: "Permission denied. Only managers can delete users.", success: false };
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if(user?.id === userId) {
        return { message: "Cannot delete your own account.", success: false };
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Supabase delete error:', error);
        return { message: `Failed to delete user: ${error.message}`, success: false };
    }

    revalidatePath('/users');
    return { message: 'Successfully deleted user.', success: true };
}
