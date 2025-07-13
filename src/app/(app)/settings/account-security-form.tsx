"use client";

import React, { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { updatePassword, type AccountFormState } from './actions';
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Account'}
    </Button>
  );
}

export function AccountSecurityForm({ email }: { email: string }) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const initialState: AccountFormState = { message: "", success: undefined };
    const [state, formAction] = useActionState(updatePassword, initialState);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Account & Security</CardTitle>
        <CardDescription>Manage your account details and security settings.</CardDescription>
      </CardHeader>
       <form action={formAction} ref={formRef}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" placeholder="New Password" />
              {state.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
       </form>
    </Card>
  );
}
