
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for adding feed stock
const addFeedStockSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  feedType: z.string().min(1, 'Feed type is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  supplier: z.string().optional(),
  cost: z.coerce.number().min(0, 'Cost cannot be negative').optional(),
});

// Schema for updating feed stock
const updateFeedStockSchema = addFeedStockSchema.extend({
    id: z.string().uuid("Invalid record ID"),
});

// Schema for adding feed allocation
const addFeedAllocationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  shed: z.string().min(1, 'Shed is required'),
  feedType: z.string().min(1, 'Feed type is required'),
  quantityAllocated: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  allocatedBy: z.string().min(1, 'Allocated by is required'),
});

// Schema for updating feed allocation
const updateFeedAllocationSchema = addFeedAllocationSchema.extend({
    id: z.string().uuid("Invalid record ID"),
});


export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

// Action to add a new feed stock item
export async function addFeedStock(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication error.', success: false };

  const validatedFields = addFeedStockSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { date, feedType, quantity, unit, supplier, cost } = validatedFields.data;

  const { error } = await supabase.from('feed_stock').insert({
    date,
    feed_type: feedType,
    quantity,
    unit,
    supplier,
    cost,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Failed to save record: ${error.message}`, success: false };
  }

  revalidatePath('/inventory');
  return { message: 'Successfully added feed stock.', success: true };
}

// Action to update a feed stock item
export async function updateFeedStock(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    const validatedFields = updateFeedStockSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { id, date, feedType, quantity, unit, supplier, cost } = validatedFields.data;

    const { error } = await supabase
        .from('feed_stock')
        .update({
            date,
            feed_type: feedType,
            quantity,
            unit,
            supplier,
            cost,
        })
        .match({ id });

    if (error) {
        console.error('Supabase update error:', error);
        return { message: `Failed to update stock: ${error.message}`, success: false };
    }

    revalidatePath('/inventory');
    return { message: 'Successfully updated feed stock.', success: true };
}

// Action to add a new feed allocation record
export async function addFeedAllocation(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'Authentication error.', success: false };

    const validatedFields = addFeedAllocationSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { date, shed, feedType, quantityAllocated, unit, allocatedBy } = validatedFields.data;

    const { error } = await supabase.from('feed_allocations').insert({
        date,
        shed,
        feed_type: feedType,
        quantity_allocated: quantityAllocated,
        unit,
        allocated_by: allocatedBy,
        user_id: user.id,
    });

    if (error) {
        console.error('Supabase error:', error);
        return { message: `Failed to save allocation: ${error.message}`, success: false };
    }

    revalidatePath('/inventory');
    return { message: 'Successfully allocated feed.', success: true };
}

// Action to update a feed allocation record
export async function updateFeedAllocation(prevState: FormState | undefined, formData: FormData): Promise<FormState> {
    const supabase = createClient();
    const validatedFields = updateFeedAllocationSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { id, date, shed, feedType, quantityAllocated, unit, allocatedBy } = validatedFields.data;

    const { error } = await supabase
        .from('feed_allocations')
        .update({
            date,
            shed,
            feed_type: feedType,
            quantity_allocated: quantityAllocated,
            unit,
            allocated_by: allocatedBy,
        })
        .match({ id });

    if (error) {
        console.error('Supabase update error:', error);
        return { message: `Failed to update allocation: ${error.message}`, success: false };
    }

    revalidatePath('/inventory');
    return { message: 'Successfully updated allocation.', success: true };
}


// Action to delete a feed stock item
export async function deleteFeedStock(id: string): Promise<{ message: string; success: boolean; }> {
  const supabase = createClient();
  const { error } = await supabase.from('feed_stock').delete().match({ id });

  if (error) {
    console.error('Supabase delete error:', error);
    return { message: `Failed to delete record: ${error.message}`, success: false };
  }

  revalidatePath('/inventory');
  return { message: 'Successfully deleted feed stock.', success: true };
}

// Action to delete a feed allocation record
export async function deleteFeedAllocation(id: string): Promise<{ message: string; success: boolean; }> {
    const supabase = createClient();
    const { error } = await supabase.from('feed_allocations').delete().match({ id });

    if (error) {
        console.error('Supabase delete error:', error);
        return { message: `Failed to delete allocation: ${error.message}`, success: false };
    }

    revalidatePath('/inventory');
    return { message: 'Successfully deleted allocation.', success: true };
}
