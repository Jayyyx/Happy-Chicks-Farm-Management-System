'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { AuthApiError } from '@supabase/supabase-js'

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});


export async function login(prevState: { message: string, errors?: z.ZodError['formErrors']['fieldErrors'], success?: boolean } | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  const validatedFields = loginFormSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Invalid fields. Failed to Login.',
        success: false,
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  })

  if (error) {
    console.error(error);
    // A common issue is that the user's email is not confirmed.
    if (error instanceof AuthApiError && error.message.includes('Email not confirmed')) {
      return {
        message: 'Email not confirmed. Please check your inbox for a confirmation link.',
        success: false,
      }
    }
    return {
        message: `Authentication failed: ${error.message}`,
        success: false,
    }
  }

  return redirect('/dashboard')
}
