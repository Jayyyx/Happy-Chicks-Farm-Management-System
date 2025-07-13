
"use client";

import React, { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { inviteUser, type InviteFormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending Invite...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" /> Send Invite
        </>
      )}
    </Button>
  );
}

export function AddUserButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: InviteFormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(inviteUser, initialState);

  useEffect(() => {
      if (state?.message) {
          toast({
              title: state.success ? "Success" : "Error",
              description: state.message,
              variant: state.success ? "default" : "destructive",
          });
      }
      if (state?.success) {
          setOpen(false);
          formRef.current?.reset();
      }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>Enter the user's details to send an email invitation. They will be prompted to set their own password.</DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef}>
                <div className="grid gap-4 py-4">
                     <div className="space-y-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="user@example.com" />
                        {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" placeholder="e.g., Jane Doe" />
                        {state?.errors?.full_name && <p className="text-sm font-medium text-destructive">{state.errors.full_name[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" defaultValue="Worker">
                            <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Worker">Worker</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                        {state?.errors?.role && <p className="text-sm font-medium text-destructive">{state.errors.role[0]}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
