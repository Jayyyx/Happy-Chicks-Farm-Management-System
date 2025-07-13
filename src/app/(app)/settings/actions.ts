
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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


// Schema for notification preferences
const notificationSchema = z.object({
  enable_low_stock_alerts: z.boolean().default(false),
  enable_high_mortality_alerts: z.boolean().default(false),
  enable_daily_summary: z.boolean().default(false),
});

export type NotificationFormState = {
  message: string;
  success?: boolean;
};

// Action to update notification preferences
export async function updateNotificationPreferences(prevState: NotificationFormState | undefined, formData: FormData): Promise<NotificationFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication error.', success: false };

  const validatedFields = notificationSchema.safeParse({
      enable_low_stock_alerts: formData.get('lowStockAlerts') === 'on',
      enable_high_mortality_alerts: formData.get('highMortalityAlerts') === 'on',
      enable_daily_summary: formData.get('dailySummary') === 'on',
  });
  
  if (!validatedFields.success) {
    return { message: 'Invalid data provided.', success: false };
  }

  const { error } = await supabase
    .from('profiles')
    .update(validatedFields.data)
    .eq('id', user.id);

  if (error) {
    console.error('Supabase update error:', error);
    return { message: `Failed to update preferences: ${error.message}`, success: false };
  }

  revalidatePath('/settings');
  return { message: 'Notification preferences updated successfully.', success: true };
}


// Schema for password update
const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export type AccountFormState = {
  message: string;
  errors?: { password?: string[] };
  success?: boolean;
};

// Action to update user password
export async function updatePassword(prevState: AccountFormState | undefined, formData: FormData): Promise<AccountFormState> {
  const supabase = createClient();
  
  const validatedFields = passwordSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
        message: "Invalid data",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({ password: validatedFields.data.password });

  if (error) {
    console.error('Supabase password update error:', error);
    return { message: `Failed to update password: ${error.message}`, success: false };
  }

  return { message: 'Password updated successfully. You may need to log in again.', success: true };
}


// Schema for farm configuration
const farmConfigSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required.'),
  shedCount: z.coerce.number().int().min(0, 'Shed count cannot be negative.'),
  defaultCurrency: z.string().min(1, 'Currency is required.'),
  timezone: z.string().min(1, 'Timezone is required.'),
});

export type FarmConfigFormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

// Action to update farm configuration
export async function updateFarmConfiguration(prevState: FarmConfigFormState | undefined, formData: FormData): Promise<FarmConfigFormState> {
  const managerCheck = await isManager();
  if (!managerCheck) {
    return { message: "Permission denied. Only managers can update farm configuration.", success: false };
  }

  const validatedFields = farmConfigSchema.safeParse({
    farmName: formData.get('farmName'),
    shedCount: formData.get('shedCount'),
    defaultCurrency: formData.get('defaultCurrency'),
    timezone: formData.get('timezone'),
  });

  if (!validatedFields.success) {
    return {
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
    };
  }
  
  const { farmName, shedCount, defaultCurrency, timezone } = validatedFields.data;

  const supabase = createClient();
  const { error } = await supabase
    .from('farm_config')
    .update({
        farm_name: farmName,
        shed_count: shedCount,
        default_currency: defaultCurrency,
        timezone: timezone,
        updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

   if (error) {
    console.error('Supabase farm config error:', error);
    return { message: `Failed to update configuration: ${error.message}`, success: false };
  }

  revalidatePath('/settings');
  return { message: 'Farm configuration updated successfully.', success: true };
}
