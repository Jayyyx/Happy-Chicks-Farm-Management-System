
"use client";

import React, { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, Loader2 } from "lucide-react";
import { updateUser, type UpdateFormState } from './actions';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserDetail = {
    id: string;
    full_name: string | null;
    role: string | null;
    status: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Edit3 className="mr-2 h-4 w-4" /> Save Changes</>}
    </Button>
  );
}

export function EditUserButton({ user }: { user: UserDetail }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const initialState: UpdateFormState = { message: "", success: undefined };
  const [state, formAction] = useActionState(updateUser, initialState);

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
      }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:text-accent"><Edit3 className="h-4 w-4" /></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit User Profile</DialogTitle>
                <DialogDescription>Update user details and permissions. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <form action={formAction}>
                <input type="hidden" name="id" value={user.id} />
                <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit_full_name">Full Name</Label>
                        <Input id="edit_full_name" name="full_name" defaultValue={user.full_name ?? ''} />
                        {state?.errors?.full_name && <p className="text-sm font-medium text-destructive">{state.errors.full_name[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit_role">Role</Label>
                        <Select name="role" defaultValue={user.role ?? 'Worker'}>
                            <SelectTrigger id="edit_role"><SelectValue placeholder="Select role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Worker">Worker</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                         {state?.errors?.role && <p className="text-sm font-medium text-destructive">{state.errors.role[0]}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit_status">Status</Label>
                        <Select name="status" defaultValue={user.status ?? 'Active'}>
                            <SelectTrigger id="edit_status"><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                         {state?.errors?.status && <p className="text-sm font-medium text-destructive">{state.errors.status[0]}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
