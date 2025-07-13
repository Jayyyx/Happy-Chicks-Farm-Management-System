
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const taskSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  assigned_to_id: z.string().uuid('Invalid user.').nullable().optional(),
  due_date: z.string().nullable().optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Blocked']),
  notes: z.string().nullable().optional(),
});

const updateTaskSchema = taskSchema.extend({
  id: z.string().uuid('Task ID is required.'),
});

export type TaskFormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success?: boolean;
};

export async function addTask(prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to add a task.', success: false };
  }

  const validatedFields = taskSchema.safeParse({
    description: formData.get('description'),
    assigned_to_id: formData.get('assigned_to_id') === 'unassigned' ? null : formData.get('assigned_to_id'),
    due_date: formData.get('due_date') || null,
    status: formData.get('status'),
    notes: formData.get('notes') || null,
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { error } = await supabase.from('tasks').insert({
    ...validatedFields.data,
    user_id: user.id,
  });

  if (error) {
    console.error('Supabase addTask error:', error);
    return { message: `Database Error: ${error.message}`, success: false };
  }

  revalidatePath('/tasks');
  return { message: 'Task added successfully.', success: true };
}


export async function updateTask(prevState: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const supabase = createClient();
   const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error: You must be logged in to update a task.', success: false };
  }

  const validatedFields = updateTaskSchema.safeParse({
    id: formData.get('id'),
    description: formData.get('description'),
    assigned_to_id: formData.get('assigned_to_id') === 'unassigned' ? null : formData.get('assigned_to_id'),
    due_date: formData.get('due_date') || null,
    status: formData.get('status'),
    notes: formData.get('notes') || null,
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { id, ...taskData } = validatedFields.data;

  const { error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id);

  if (error) {
     console.error('Supabase updateTask error:', error);
    return { message: `Database Error: ${error.message}`, success: false };
  }

  revalidatePath('/tasks');
  return { message: 'Task updated successfully.', success: true };
}


export async function deleteTask(taskId: string): Promise<{ message: string, success: boolean }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'Authentication Error.', success: false };
  }

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    console.error('Supabase deleteTask error:', error);
    return { message: `Database Error: ${error.message}`, success: false };
  }

  revalidatePath('/tasks');
  return { message: 'Task deleted successfully.', success: true };
}
