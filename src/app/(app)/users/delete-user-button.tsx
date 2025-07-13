
"use client";

import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { deleteUser } from './actions';
import { useToast } from "@/hooks/use-toast";
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction asChild>
        <Button
            type="submit"
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
            ) : (
                "Yes, delete user"
            )}
        </Button>
    </AlertDialogAction>
  );
}

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string | null }) {
    const { toast } = useToast();
    const deleteActionWithId = deleteUser.bind(null, userId);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form action={async () => {
                    const result = await deleteActionWithId();
                    toast({
                        title: result.success ? "Success" : "Error",
                        description: result.message,
                        variant: result.success ? "default" : "destructive",
                    });
                }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            for <span className="font-semibold">{userName || 'this user'}</span> and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <SubmitButton />
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
